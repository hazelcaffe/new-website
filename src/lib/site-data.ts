import { mkdir, open, readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { siteDataFile } from "./paths";

export type LastUpdate = {
    text: string;
    updatedAt: string;
};

export type UrlVisit = {
    ip: string;
    userAgent: string;
    visitedAt: string;
};

export type ShortUrl = {
    createdAt: string;
    url: string;
    visits: UrlVisit[];
};

export type SiteData = {
    lastUpdate: LastUpdate;
    urls: Record<string, ShortUrl>;
};

const defaultData: SiteData = {
    lastUpdate: {
        text: "Welcome to my website!",
        updatedAt: new Date(0).toISOString()
    },
    urls: {}
};
const lockFile = `${siteDataFile}.lock`;
const reservedVanities = new Set([
    "88x31",
    "api",
    "atom.xml",
    "blog",
    "feed.json",
    "favicon.png",
    "oneko.gif",
    "oneko.js",
    "pfp.png",
    "projects",
    "rss.xml",
    "robots.txt"
]);

/**
 * Keeps lock contention from blocking unrelated work on the server event loop.
 */
function sleep(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/**
 * Prevents malformed or manually edited JSON from leaking invalid top-level state to callers.
 */
function normalizeData(value: unknown): SiteData {
    if (!value || typeof value !== "object") return structuredClone(defaultData);
    const candidate = value as Partial<SiteData>;
    const lastUpdate = candidate.lastUpdate;
    const urls = candidate.urls;

    return {
        lastUpdate: {
            text:
                lastUpdate && typeof lastUpdate.text === "string"
                    ? lastUpdate.text
                    : defaultData.lastUpdate.text,
            updatedAt:
                lastUpdate && typeof lastUpdate.updatedAt === "string"
                    ? lastUpdate.updatedAt
                    : defaultData.lastUpdate.updatedAt
        },
        urls: urls && typeof urls === "object" ? (urls as Record<string, ShortUrl>) : {}
    };
}

/**
 * Allows a fresh deployment to start before the shared database has been created.
 */
export async function readSiteData(): Promise<SiteData> {
    try {
        return normalizeData(JSON.parse(await readFile(siteDataFile, "utf8")));
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
            return structuredClone(defaultData);
        }
        throw error;
    }
}

/**
 * Prevents the website and bot from overwriting each other's concurrent database changes.
 */
async function withDataLock<T>(operation: () => Promise<T>): Promise<T> {
    await mkdir(path.dirname(siteDataFile), { recursive: true });

    for (let attempt = 0; attempt < 100; attempt += 1) {
        try {
            const lock = await open(lockFile, "wx");
            try {
                return await operation();
            } finally {
                await lock.close();
                await unlink(lockFile).catch(() => undefined);
            }
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
            const lockInfo = await stat(lockFile).catch((statError) => {
                if ((statError as NodeJS.ErrnoException).code === "ENOENT") return null;
                throw statError;
            });
            if (!lockInfo) continue;
            const lockAge = Date.now() - lockInfo.mtimeMs;
            if (lockAge > 30_000) {
                await unlink(lockFile).catch(() => undefined);
                continue;
            }
            await sleep(25);
        }
    }

    throw new Error("Timed out waiting for the site data lock.");
}

/**
 * Keeps readers from observing truncated JSON if a process exits during a write.
 */
async function writeSiteData(data: SiteData): Promise<void> {
    const temporaryFile = `${siteDataFile}.${process.pid}.tmp`;
    await writeFile(temporaryFile, `${JSON.stringify(data, null, 4)}\n`, "utf8");
    await rename(temporaryFile, siteDataFile);
}

/**
 * Keeps every read-modify-write cycle inside the same cross-process lock.
 */
async function updateSiteData<T>(mutate: (data: SiteData) => T | Promise<T>): Promise<T> {
    return withDataLock(async () => {
        const data = await readSiteData();
        const result = await mutate(data);
        await writeSiteData(data);
        return result;
    });
}

/**
 * Couples update text with its timestamp so the profile tooltip cannot drift out of sync.
 */
export async function setLastUpdate(text: string): Promise<LastUpdate> {
    const normalized = text.trim();
    if (!normalized) throw new Error("Update text cannot be empty.");

    return updateSiteData((data) => {
        data.lastUpdate = {
            text: normalized,
            updatedAt: new Date().toISOString()
        };
        return data.lastUpdate;
    });
}

/**
 * Keeps Discord list and autocomplete output stable across filesystem reads.
 */
export async function listShortUrls(): Promise<Array<{ vanity: string } & ShortUrl>> {
    const data = await readSiteData();
    return Object.entries(data.urls)
        .map(([vanity, record]) => ({ vanity, ...record }))
        .sort((left, right) => left.vanity.localeCompare(right.vanity));
}

/**
 * Supports administrative lookups without inflating public redirect analytics.
 */
export async function getShortUrl(vanity: string): Promise<ShortUrl | null> {
    const data = await readSiteData();
    return data.urls[vanity.toLowerCase()] || null;
}

/**
 * Protects real site routes and avoids ambiguous path-like vanity names.
 */
export function validateVanity(vanity: string): string {
    const normalized = vanity.trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9_-]{0,31}$/.test(normalized)) {
        throw new Error("Vanity must be 1-32 characters using letters, numbers, _ or -.");
    }
    if (reservedVanities.has(normalized)) {
        throw new Error(`"${normalized}" is reserved by the website.`);
    }
    return normalized;
}

/**
 * Prevents shortened URLs from launching unsafe or unsupported URI schemes.
 */
export function validateTargetUrl(target: string): string {
    const url = new URL(target);
    if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("URL must use http:// or https://.");
    }
    return url.toString();
}

/**
 * Requires explicit removal before reuse so existing public links cannot change unexpectedly.
 */
export async function addShortUrl(vanity: string, target: string): Promise<ShortUrl> {
    const normalizedVanity = validateVanity(vanity);
    const normalizedTarget = validateTargetUrl(target);

    return updateSiteData((data) => {
        if (data.urls[normalizedVanity]) {
            throw new Error(`"${normalizedVanity}" already exists.`);
        }

        const record: ShortUrl = {
            createdAt: new Date().toISOString(),
            url: normalizedTarget,
            visits: []
        };
        data.urls[normalizedVanity] = record;
        return record;
    });
}

/**
 * Reports absence so administrative commands can distinguish success from a typo.
 */
export async function removeShortUrl(vanity: string): Promise<boolean> {
    const normalizedVanity = vanity.trim().toLowerCase();
    return updateSiteData((data) => {
        if (!data.urls[normalizedVanity]) return false;
        delete data.urls[normalizedVanity];
        return true;
    });
}

/**
 * Couples analytics with target resolution so missing vanities never create visit records.
 */
export async function recordShortUrlVisit(
    vanity: string,
    viewer: Omit<UrlVisit, "visitedAt">
): Promise<string | null> {
    const normalizedVanity = vanity.trim().toLowerCase();
    return updateSiteData((data) => {
        const record = data.urls[normalizedVanity];
        if (!record) return null;
        record.visits.push({
            ...viewer,
            visitedAt: new Date().toISOString()
        });
        return record.url;
    });
}

import { readFile, writeFile } from "node:fs/promises";
import { visitorsFile } from "./paths";

let visitorQueue: Promise<unknown> = Promise.resolve();

/**
 * Treats a missing visitor file as an empty counter so first startup needs no manual seed.
 */
export async function readVisitors(): Promise<string[]> {
    try {
        const visitors: unknown = JSON.parse(await readFile(visitorsFile, "utf8"));
        return Array.isArray(visitors)
            ? visitors.filter((value): value is string => typeof value === "string")
            : [];
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
            return [];
        }
        throw error;
    }
}

/**
 * Trusts forwarding headers only when deployment configuration guarantees a controlled proxy.
 */
export function getVisitorIp(request: Request, clientAddress?: string, trustProxy = true): string {
    if (trustProxy) {
        const cloudflareIp = request.headers.get("cf-connecting-ip")?.trim();
        if (cloudflareIp) return cloudflareIp;

        const forwardedIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
        if (forwardedIp) return forwardedIp;

        const realIp = request.headers.get("x-real-ip")?.trim();
        if (realIp) return realIp;
    }

    return clientAddress || "unknown";
}

/**
 * Serializes writes because overlapping requests could otherwise lose newly recorded addresses.
 */
export async function recordVisitor(ip: string): Promise<{ count: number; newVisitor: boolean }> {
    const operation = visitorQueue
        .catch(() => undefined)
        .then(async () => {
            const visitors = await readVisitors();
            const newVisitor = !visitors.includes(ip);

            if (newVisitor) {
                visitors.push(ip);
                await writeFile(visitorsFile, `${JSON.stringify(visitors, null, 2)}\n`, "utf8");
            }

            return { count: visitors.length, newVisitor };
        });

    visitorQueue = operation;
    return operation;
}

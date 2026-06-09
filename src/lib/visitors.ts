import { readFile, writeFile } from "node:fs/promises";
import { visitorsFile } from "./paths";

let visitorQueue: Promise<unknown> = Promise.resolve();

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

export function getVisitorIp(request: Request, clientAddress?: string): string {
    const cloudflareIp = request.headers.get("cf-connecting-ip")?.trim();
    if (cloudflareIp) return cloudflareIp;

    const forwardedIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    if (forwardedIp) return forwardedIp;

    return clientAddress || "unknown";
}

export async function recordVisitor(ip: string) {
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

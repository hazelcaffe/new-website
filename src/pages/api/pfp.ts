import { readdir } from "node:fs/promises";
import type { APIRoute } from "astro";
import { pfpsDirectory } from "../../lib/paths";

const imageExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);

/**
 * Lists only browser-compatible image files so random avatar selection cannot choose junk files.
 */
export const GET: APIRoute = async () => {
    try {
        const entries = await readdir(pfpsDirectory, { withFileTypes: true });
        const paths = entries
            .filter((entry) => {
                const extension = entry.name.slice(entry.name.lastIndexOf(".")).toLowerCase();
                return entry.isFile() && imageExtensions.has(extension);
            })
            .map((entry) => `/pfps/${encodeURIComponent(entry.name)}`)
            .sort();

        return Response.json(paths, {
            headers: { "Cache-Control": "public, max-age=300" }
        });
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
            return Response.json([]);
        }

        console.error("PFP listing error:", error);
        return Response.json({ error: "Profile pictures are unavailable." }, { status: 500 });
    }
};

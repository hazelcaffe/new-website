import { readdir } from "node:fs/promises";
import type { APIRoute } from "astro";
import buttonLinks from "../../../config/buttons.json";
import { buttonsDirectory } from "../../../lib/paths";

export const GET: APIRoute = async () => {
    try {
        const entries = await readdir(buttonsDirectory, { withFileTypes: true });
        const buttons = entries
            .filter((entry) => entry.isFile())
            .map((entry) => ({
                src: `/api/88x31/${encodeURIComponent(entry.name)}`,
                href: buttonLinks[entry.name as keyof typeof buttonLinks] || null
            }))
            .sort((a, b) => a.src.localeCompare(b.src));

        return Response.json(buttons, {
            headers: { "Cache-Control": "no-cache" }
        });
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
            return Response.json([]);
        }

        console.error("88x31 listing error:", error);
        return Response.json(
            { error: "88x31 buttons are temporarily unavailable." },
            { status: 500 }
        );
    }
};

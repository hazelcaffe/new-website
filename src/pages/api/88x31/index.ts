import { readdir } from "node:fs/promises";
import type { APIRoute } from "astro";
import configuredButtons from "../../../config/buttons.json";
import { buttonsDirectory } from "../../../lib/paths";

/**
 * Preserves configured button order while still exposing newly added unconfigured files.
 */
export const GET: APIRoute = async () => {
    try {
        const entries = await readdir(buttonsDirectory, { withFileTypes: true });
        const available = new Set(
            entries.filter((entry) => entry.isFile()).map((entry) => entry.name)
        );
        const configured = configuredButtons
            .filter((button) => available.delete(button.file))
            .map((button) => ({
                src: `/88x31/${encodeURIComponent(button.file)}`,
                href: button.href
            }));
        const remaining = [...available]
            .sort()
            .map((file) => ({ src: `/88x31/${encodeURIComponent(file)}`, href: null }));
        const buttons = [...configured, ...remaining];

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

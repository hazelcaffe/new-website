import type { APIRoute } from "astro";
import { loadButtons } from "../../../lib/buttons";

/**
 * Preserves configured button order while still exposing newly added unconfigured files.
 */
export const GET: APIRoute = async () => {
    try {
        const buttons = await loadButtons();

        return Response.json(buttons, {
            headers: { "Cache-Control": "no-cache" }
        });
    } catch (error) {
        console.error("88x31 listing error:", error);
        return Response.json(
            { error: "88x31 buttons are temporarily unavailable." },
            { status: 500 }
        );
    }
};

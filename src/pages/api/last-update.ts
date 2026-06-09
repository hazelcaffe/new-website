import type { APIRoute } from "astro";
import { readSiteData } from "../../lib/site-data";

/**
 * Returns uncached bot-managed text so profile updates appear without a deployment.
 */
export const GET: APIRoute = async () => {
    try {
        const data = await readSiteData();
        return Response.json(data.lastUpdate, {
            headers: { "Cache-Control": "no-store" }
        });
    } catch (error) {
        console.error("Last update error:", error);
        return Response.json({ error: "Last update is unavailable." }, { status: 500 });
    }
};

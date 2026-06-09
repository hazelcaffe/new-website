import type { APIRoute } from "astro";
import statuses from "../../content/statuses.json";

/**
 * Publishes offline status choices so clients and external tools share one configured list.
 */
export const GET: APIRoute = () =>
    Response.json(statuses, {
        headers: { "Cache-Control": "public, max-age=300" }
    });

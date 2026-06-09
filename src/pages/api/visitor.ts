import type { APIRoute } from "astro";
import { env } from "../../lib/env";
import { getVisitorIp, readVisitors, recordVisitor } from "../../lib/visitors";

const noStoreHeaders = {
    Allow: "GET, POST, OPTIONS",
    "Cache-Control": "private, no-store, max-age=0",
    "CDN-Cache-Control": "no-store"
};

/**
 * Advertises supported methods for proxies and clients that perform preflight checks.
 */
export const OPTIONS: APIRoute = () => new Response(null, { status: 204, headers: noStoreHeaders });

/**
 * Reads the count or records through a GET fallback for restrictive production proxies.
 */
export const GET: APIRoute = async ({ request, clientAddress }) => {
    try {
        const url = new URL(request.url);
        if (url.searchParams.get("record") === "1") {
            const result = await recordVisitor(
                getVisitorIp(request, clientAddress, env.TRUST_PROXY)
            );
            return Response.json(result, { headers: noStoreHeaders });
        }

        const visitors = await readVisitors();
        return Response.json({ count: visitors.length }, { headers: noStoreHeaders });
    } catch (error) {
        console.error("Visitor counter error:", error);
        return Response.json(
            { error: "Visitor counter is temporarily unavailable." },
            { status: 500, headers: noStoreHeaders }
        );
    }
};

/**
 * Retains the conventional mutation endpoint for clients whose proxy allows POST requests.
 */
export const POST: APIRoute = async ({ request, clientAddress }) => {
    try {
        const result = await recordVisitor(getVisitorIp(request, clientAddress, env.TRUST_PROXY));
        return Response.json(result, { headers: noStoreHeaders });
    } catch (error) {
        console.error("Visitor counter error:", error);
        return Response.json(
            { error: "Visitor counter is temporarily unavailable." },
            { status: 500, headers: noStoreHeaders }
        );
    }
};

import type { APIRoute } from "astro";
import { env } from "../lib/env";
import { recordShortUrlVisit } from "../lib/site-data";
import { getVisitorIp } from "../lib/visitors";

/**
 * Records redirect analytics before leaving the site so every resolved vanity has an audit trail.
 */
export const GET: APIRoute = async ({ clientAddress, params, request }) => {
    const vanity = params.vanity;
    if (!vanity) return new Response(null, { status: 404 });

    try {
        const target = await recordShortUrlVisit(vanity, {
            ip: getVisitorIp(request, clientAddress, env.TRUST_PROXY),
            userAgent: request.headers.get("user-agent") || "unknown"
        });
        if (!target) return new Response(null, { status: 404 });

        return Response.redirect(target, 302);
    } catch (error) {
        console.error("Short URL redirect error:", error);
        return new Response("Redirect is temporarily unavailable.", { status: 500 });
    }
};

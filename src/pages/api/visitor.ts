import type { APIRoute } from "astro";
import { getVisitorIp, readVisitors, recordVisitor } from "../../lib/visitors";

const noStoreHeaders = { "Cache-Control": "no-store" };

export const GET: APIRoute = async () => {
    try {
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

export const POST: APIRoute = async ({ request, clientAddress }) => {
    try {
        const result = await recordVisitor(getVisitorIp(request, clientAddress));
        return Response.json(result, { headers: noStoreHeaders });
    } catch (error) {
        console.error("Visitor counter error:", error);
        return Response.json(
            { error: "Visitor counter is temporarily unavailable." },
            { status: 500, headers: noStoreHeaders }
        );
    }
};

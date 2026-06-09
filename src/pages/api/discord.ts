import type { APIRoute } from "astro";
import { env } from "../../lib/env";

type Activity = {
    type?: number;
    name?: string;
    state?: string;
    emoji?: { name?: string };
};

function getCustomStatus(activities: Activity[] = []) {
    const status = activities.find(
        (activity) => activity.type === 4 || activity.name === "Custom Status"
    );

    if (!status) return null;
    return [status.emoji?.name, status.state].filter(Boolean).join(" ").trim() || null;
}

export const GET: APIRoute = async () => {
    try {
        const upstream = await fetch(
            `https://api.lanyard.rest/v1/users/${encodeURIComponent(env.DISCORD_USER_ID)}`
        );

        if (!upstream.ok) {
            throw new Error(`Lanyard returned HTTP ${upstream.status}`);
        }

        const payload = await upstream.json();
        if (!payload.success || !payload.data) {
            throw new Error("Lanyard did not return presence data");
        }

        const presence = payload.data;
        return Response.json({
            status: presence.discord_status || "offline",
            statusText: getCustomStatus(presence.activities),
            username: presence.discord_user?.global_name || presence.discord_user?.username || null,
            avatarUrl: presence.discord_user?.avatar
                ? `https://cdn.discordapp.com/avatars/${presence.discord_user.id}/${presence.discord_user.avatar}.png?size=128`
                : null,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("Discord activity error:", error);
        return Response.json(
            { error: "Discord activity is temporarily unavailable." },
            { status: 502 }
        );
    }
};

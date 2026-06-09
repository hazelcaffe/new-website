import type { APIRoute } from "astro";
import statuses from "../../content/statuses.json";
import { withCache } from "../../lib/cache";
import { env } from "../../lib/env";

type Activity = {
    emoji?: { name?: string };
    name?: string;
    state?: string;
    type?: number;
};

/**
 * Ignores unrelated activities so the profile only presents the user's intentional status text.
 */
function getCustomStatus(activities: Activity[] = []): string | null {
    const status = activities.find(
        (activity) => activity.type === 4 || activity.name === "Custom Status"
    );

    if (!status) return null;
    return [status.emoji?.name, status.state].filter(Boolean).join(" ").trim() || null;
}

/**
 * Normalizes Lanyard's response so clients do not depend on its upstream schema.
 */
async function loadDiscordPresence() {
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
    const status = presence.discord_status || "offline";
    return {
        status,
        statusText:
            getCustomStatus(presence.activities) ||
            (status === "offline" ? statuses[Math.floor(Math.random() * statuses.length)] : null),
        username: presence.discord_user?.global_name || presence.discord_user?.username || null,
        avatarUrl: presence.discord_user?.avatar
            ? `https://cdn.discordapp.com/avatars/${presence.discord_user.id}/${presence.discord_user.avatar}.png?size=128`
            : null,
        updatedAt: new Date().toISOString()
    };
}

/**
 * Serves cached Discord presence because frequent client polling should not pressure Lanyard.
 */
export const GET: APIRoute = async () => {
    try {
        const response = await withCache("discord-presence", 10_000, loadDiscordPresence);

        return Response.json(response, {
            headers: { "Cache-Control": "public, max-age=5, stale-while-revalidate=10" }
        });
    } catch (error) {
        console.error("Discord activity error:", error);
        return Response.json(
            { error: "Discord activity is temporarily unavailable." },
            { status: 502 }
        );
    }
};

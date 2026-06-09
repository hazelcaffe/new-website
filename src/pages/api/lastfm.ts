import type { APIRoute } from "astro";
import { withCache } from "../../lib/cache";
import { env } from "../../lib/env";
import { getLargestImage, lastfmUrl } from "../../lib/lastfm";

/**
 * Normalizes Last.fm's variable track shape into the stable fields used by the card.
 */
async function loadRecentTrack() {
    const query = new URLSearchParams({
        method: "user.getRecentTracks",
        user: env.LASTFM_USERNAME,
        api_key: env.LASTFM_API_KEY,
        format: "json",
        limit: "1",
        extended: "1"
    });
    const upstream = await fetch(`https://ws.audioscrobbler.com/2.0/?${query}`);

    if (!upstream.ok) {
        throw new Error(`Last.fm returned HTTP ${upstream.status}`);
    }

    const payload = await upstream.json();
    if (payload.error) {
        throw new Error(`Last.fm error ${payload.error}: ${payload.message}`);
    }

    const tracks = payload.recenttracks?.track;
    const track = Array.isArray(tracks) ? tracks[0] : tracks;

    if (!track) {
        return { track: null, updatedAt: new Date().toISOString() };
    }

    const artist = track.artist?.name || track.artist?.["#text"] || null;
    const album = track.album?.["#text"] || null;

    return {
        track: {
            nowPlaying: track["@attr"]?.nowplaying === "true",
            title: track.name || null,
            artist,
            album,
            imageUrl: getLargestImage(track.image),
            trackUrl: track.url || lastfmUrl(artist, "_", track.name),
            artistUrl: track.artist?.url || lastfmUrl(artist),
            albumUrl: album ? lastfmUrl(artist, album) : null,
            playedAt: track.date?.uts ? new Date(Number(track.date.uts) * 1000).toISOString() : null
        },
        updatedAt: new Date().toISOString()
    };
}

/**
 * Serves cached scrobbles because browser polling should not consume Last.fm's rate limit.
 */
export const GET: APIRoute = async () => {
    try {
        const response = await withCache("lastfm-recent-track", 10_000, loadRecentTrack);

        return Response.json(response, {
            headers: { "Cache-Control": "public, max-age=5, stale-while-revalidate=10" }
        });
    } catch (error) {
        console.error("Last.fm activity error:", error);
        return Response.json(
            { error: "Last.fm activity is temporarily unavailable." },
            { status: 502 }
        );
    }
};

import type { APIRoute } from "astro";
import { env } from "../../lib/env";
import { getLargestImage, lastfmUrl } from "../../lib/lastfm";

export const GET: APIRoute = async () => {
    try {
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
            return Response.json({ track: null, updatedAt: new Date().toISOString() });
        }

        const artist = track.artist?.name || track.artist?.["#text"] || null;
        const album = track.album?.["#text"] || null;

        return Response.json({
            track: {
                nowPlaying: track["@attr"]?.nowplaying === "true",
                title: track.name || null,
                artist,
                album,
                imageUrl: getLargestImage(track.image),
                trackUrl: track.url || lastfmUrl(artist, "_", track.name),
                artistUrl: track.artist?.url || lastfmUrl(artist),
                albumUrl: album ? lastfmUrl(artist, album) : null,
                playedAt: track.date?.uts
                    ? new Date(Number(track.date.uts) * 1000).toISOString()
                    : null
            },
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("Last.fm activity error:", error);
        return Response.json(
            { error: "Last.fm activity is temporarily unavailable." },
            { status: 502 }
        );
    }
};

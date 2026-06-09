import { useEffect, useState } from "react";

type Track = {
    nowPlaying: boolean;
    title: string | null;
    artist: string | null;
    album: string | null;
    imageUrl: string | null;
    trackUrl: string;
    artistUrl: string;
    albumUrl: string | null;
    playedAt: string | null;
};

function relativeTime(date: string | null) {
    if (!date) return "recently";
    const seconds = Math.max(0, Math.floor((Date.now() - Date.parse(date)) / 1000));
    if (seconds < 60) return "less than a minute ago";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

export default function LastFmCard() {
    const [track, setTrack] = useState<Track | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [artFailed, setArtFailed] = useState(false);

    useEffect(() => {
        let active = true;
        let timer: number;

        async function poll() {
            try {
                const response = await fetch("/api/lastfm", { cache: "no-store" });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Last.fm unavailable");
                if (active) {
                    setTrack(data.track);
                    setError(null);
                    setArtFailed(false);
                }
            } catch (reason) {
                if (active) {
                    setError(reason instanceof Error ? reason.message : "Last.fm unavailable");
                }
            } finally {
                if (active) {
                    setLoading(false);
                    timer = window.setTimeout(poll, 2000);
                }
            }
        }

        void poll();
        return () => {
            active = false;
            window.clearTimeout(timer);
        };
    }, []);

    const artUrl = track?.albumUrl || track?.trackUrl || "https://www.last.fm";

    return (
        <section className="window now-playing">
            <div className="window-body">
                <a
                    className="album-art"
                    href={artUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={
                        track?.album ? `Open ${track.album} on Last.fm` : "Open track on Last.fm"
                    }
                >
                    {track?.imageUrl && !artFailed ? (
                        <img
                            src={track.imageUrl}
                            alt={
                                track.album
                                    ? `Cover art for ${track.album}`
                                    : `Artwork for ${track.title}`
                            }
                            onError={() => setArtFailed(true)}
                        />
                    ) : (
                        <>
                            <div className="cd" />
                            <span>
                                last
                                <br />
                                fm
                            </span>
                        </>
                    )}
                </a>

                <div className="track">
                    <p>
                        {loading
                            ? "checking recent tracks..."
                            : error
                              ? "last.fm unavailable"
                              : track?.nowPlaying
                                ? "currently listening to..."
                                : track
                                  ? `last played ${relativeTime(track.playedAt)}`
                                  : "no recent tracks"}
                    </p>
                    <h3>
                        <a
                            href={track?.trackUrl || "https://www.last.fm"}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {error ? "could not load music" : track?.title || "quiet for now"}
                        </a>
                    </h3>
                    <a
                        href={track?.artistUrl || "https://www.last.fm"}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {error || track?.artist || ""}
                    </a>
                    <small>
                        {track?.album && (
                            <a
                                href={track.albumUrl || track.trackUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                from {track.album}
                            </a>
                        )}
                    </small>
                </div>
                <p className="activity-updated" aria-live="polite">
                    {track ? (track.nowPlaying ? "live via last.fm" : "recently scrobbled") : ""}
                </p>
            </div>
        </section>
    );
}

import { useEffect, useState } from "react";
import site from "../config/site.json";

type DiscordData = {
    avatarUrl: string | null;
    statusText: string | null;
};

type LastUpdate = {
    text: string;
    updatedAt: string;
};

const transColors = ["trans-pink", "trans-blue", "trans-white"];
const lesbianColors = ["lesbian-orange", "lesbian-white", "lesbian-pink"];

/**
 * Alternates decorative color classes without counting spaces.
 */
function ColoredText({ text, colors }: { text: string; colors: string[] }): React.JSX.Element[] {
    let visibleIndex = 0;
    let tokenIndex = 0;

    return text.split("").map((character) => {
        const key = `${character}-${tokenIndex}`;
        tokenIndex += 1;

        if (character === " ") return <span key={key}> </span>;

        const className = colors[visibleIndex % colors.length];
        visibleIndex += 1;
        return (
            <span className={className} key={key}>
                {character}
            </span>
        );
    });
}

/**
 * Combines static profile details with independently refreshed site and Discord data.
 */
export default function ProfileCard() {
    const [discord, setDiscord] = useState<DiscordData>({
        avatarUrl: null,
        statusText: "checking discord..."
    });
    const [localAvatarUrl, setLocalAvatarUrl] = useState("/pfps/default.png");
    const [lastUpdate, setLastUpdate] = useState<LastUpdate | null>(null);
    const [showDiscordAvatar, setShowDiscordAvatar] = useState(false);
    const [localAvatarFailed, setLocalAvatarFailed] = useState(false);
    const [discordAvatarFailed, setDiscordAvatarFailed] = useState(false);

    useEffect(
        /**
         * Coordinates independent profile feeds under one lifecycle to prevent stale state writes.
         */
        function synchronizeProfileData() {
            let active = true;
            let timer: number;

            /**
             * Chooses a local avatar once per page load while retaining a reliable fallback.
             */
            async function loadLocalAvatar() {
                try {
                    const response = await fetch("/api/pfp");
                    const paths = await response.json();
                    if (!response.ok || !Array.isArray(paths) || paths.length === 0) return;
                    if (active) setLocalAvatarUrl(paths[Math.floor(Math.random() * paths.length)]);
                } catch {
                    // A failed discovery request should not replace the known-good default image.
                }
            }

            /**
             * Refreshes Discord presence without allowing a stale component to receive state updates.
             */
            async function poll() {
                try {
                    const response = await fetch("/api/discord", { cache: "no-store" });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error || "Discord unavailable");
                    if (active) {
                        setDiscord(data);
                        setDiscordAvatarFailed(false);
                    }
                } catch (error) {
                    if (active) {
                        setDiscord((current) => ({
                            ...current,
                            statusText:
                                error instanceof Error ? error.message : "Discord unavailable"
                        }));
                    }
                } finally {
                    if (active) timer = window.setTimeout(poll, 15_000);
                }
            }

            /**
             * Refreshes bot-managed text separately so Discord outages do not hide site updates.
             */
            async function loadLastUpdate() {
                try {
                    const response = await fetch("/api/last-update", { cache: "no-store" });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error || "Last update unavailable");
                    if (active) setLastUpdate(data);
                } catch {
                    // Hiding stale or unavailable update text is less misleading than inventing a value.
                }
            }

            void loadLocalAvatar();
            void loadLastUpdate();
            void poll();
            const updateTimer = window.setInterval(loadLastUpdate, 30_000);
            return () => {
                active = false;
                window.clearTimeout(timer);
                window.clearInterval(updateTimer);
            };
        },
        []
    );

    const discordAvatarUrl = discordAvatarFailed ? null : discord.avatarUrl;
    const avatarUrl = showDiscordAvatar
        ? discordAvatarUrl
        : localAvatarFailed
          ? null
          : localAvatarUrl;
    const avatarAlt = showDiscordAvatar ? "Hazel's Discord avatar" : "Hazel's profile picture";

    return (
        <section className="window profile-window" id="about">
            <div className="window-body">
                <div className="avatar-wrap">
                    <button
                        className="avatar"
                        type="button"
                        aria-label={
                            showDiscordAvatar
                                ? "Show Hazel's profile picture"
                                : "Show Hazel's Discord avatar"
                        }
                        title={
                            showDiscordAvatar
                                ? "Click to show profile picture"
                                : "Click to show Discord avatar"
                        }
                        onClick={() => setShowDiscordAvatar((current) => !current)}
                    >
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={avatarAlt}
                                onError={() => {
                                    if (showDiscordAvatar) setDiscordAvatarFailed(true);
                                    else setLocalAvatarFailed(true);
                                }}
                            />
                        ) : (
                            <>
                                <div className="computer">
                                    <div className="screen">
                                        <span>^_^</span>
                                    </div>
                                    <div className="base" />
                                </div>
                                <span className="avatar-star a1">+</span>
                                <span className="avatar-star a2">*</span>
                            </>
                        )}
                    </button>
                </div>

                <h2 className="lesbian-text" aria-label={site.profile.greeting}>
                    <ColoredText text={site.profile.greeting} colors={lesbianColors} />
                </h2>
                <p className="small-copy">{site.profile.summary}</p>

                <dl className="profile-facts">
                    <div>
                        <dt>pronouns</dt>
                        <dd className="trans-text">
                            <span aria-hidden="true">
                                <ColoredText text={site.profile.pronouns} colors={transColors} />
                            </span>
                            <span className="sr-only">{site.profile.pronouns}</span>
                        </dd>
                    </div>
                    <div>
                        <dt>status</dt>
                        <dd>{discord.statusText || "no custom status"}</dd>
                    </div>
                </dl>

                {lastUpdate && (
                    <aside
                        className="last-update"
                        title={`Last updated ${new Date(lastUpdate.updatedAt).toLocaleString()}`}
                    >
                        <strong>last update</strong>
                        <p>{lastUpdate.text}</p>
                    </aside>
                )}
            </div>
        </section>
    );
}

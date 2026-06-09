import { useEffect, useState } from "react";
import site from "../config/site.json";

type DiscordData = {
    statusText: string | null;
    avatarUrl: string | null;
};

const transColors = ["trans-pink", "trans-blue", "trans-white"];
const lesbianColors = ["lesbian-orange", "lesbian-white", "lesbian-pink"];

function ColoredText({ text, colors }: { text: string; colors: string[] }) {
    let visibleIndex = 0;
    let tokenIndex = 0;

    return text.split("").map((character) => {
        const key = `${character}-${tokenIndex}`;
        tokenIndex += 1;

        if (character === " ") {
            return <span key={key}> </span>;
        }

        const className = colors[visibleIndex % colors.length];
        visibleIndex += 1;
        return (
            <span className={className} key={key}>
                {character}
            </span>
        );
    });
}

export default function ProfileCard() {
    const [discord, setDiscord] = useState<DiscordData>({
        statusText: "checking discord...",
        avatarUrl: null
    });
    const [showDiscordAvatar, setShowDiscordAvatar] = useState(false);
    const [localAvatarFailed, setLocalAvatarFailed] = useState(false);
    const [discordAvatarFailed, setDiscordAvatarFailed] = useState(false);

    useEffect(() => {
        let active = true;
        let timer: number;

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
                        statusText: error instanceof Error ? error.message : "Discord unavailable"
                    }));
                }
            } finally {
                if (active) timer = window.setTimeout(poll, 2000);
            }
        }

        void poll();
        return () => {
            active = false;
            window.clearTimeout(timer);
        };
    }, []);

    const discordAvatarUrl = discordAvatarFailed ? null : discord.avatarUrl;
    const avatarUrl = showDiscordAvatar ? discordAvatarUrl : localAvatarFailed ? null : "/pfp.png";
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
                                    if (showDiscordAvatar) {
                                        setDiscordAvatarFailed(true);
                                    } else {
                                        setLocalAvatarFailed(true);
                                    }
                                }}
                            />
                        ) : (
                            <>
                                <div className="computer">
                                    <div className="screen">
                                        <span>^‿^</span>
                                    </div>
                                    <div className="base" />
                                </div>
                                <span className="avatar-star a1">✦</span>
                                <span className="avatar-star a2">✧</span>
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
            </div>
        </section>
    );
}

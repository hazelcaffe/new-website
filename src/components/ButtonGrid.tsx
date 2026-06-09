import { useEffect, useState } from "react";

const ownerButtonPath = "/88x31/hazelcaffe.png";
const ownerButtonEmbed =
    '<a href="https://qwq.sh"><img src="https://qwq.sh/88x31/hazelcaffe.png" alt="Hazel\'s website"></a>';

type Button = {
    src: string;
    href: string | null;
    iframe: boolean;
};

/**
 * Displays the configured 88x31 collection and exposes Hazel's embed code.
 */
export default function ButtonGrid() {
    const [buttons, setButtons] = useState<Button[] | null>(null);
    const [copied, setCopied] = useState(false);
    const [failed, setFailed] = useState(false);

    useEffect(
        /**
         * Fetches runtime-managed button data once because the collection is static per page view.
         */
        function initializeButtons() {
            /**
             * Loads button metadata at runtime so files can change without rebuilding the client bundle.
             */
            async function loadButtons() {
                try {
                    const response = await fetch("/api/88x31", { cache: "no-store" });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error);
                    setButtons(data);
                } catch {
                    setFailed(true);
                }
            }

            void loadButtons();
        },
        []
    );

    if (failed) {
        return <span className="button-grid-message">could not load buttons</span>;
    }

    if (!buttons) {
        return <span className="button-grid-message">loading buttons...</span>;
    }

    if (!buttons.length) {
        return <span className="button-grid-message">no buttons yet</span>;
    }

    const otherButtons = buttons.filter((button) => button.src !== ownerButtonPath);

    /**
     * Copies the canonical embed rather than relying on users to reconstruct the markup.
     */
    async function copyOwnerButton() {
        try {
            await navigator.clipboard.writeText(ownerButtonEmbed);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    }

    return (
        <div className="button-collection">
            <button className="owner-button-row" type="button" onClick={copyOwnerButton}>
                <img src={ownerButtonPath} width={88} height={31} alt="Hazel's website" />
                <span>{copied ? "copied!" : "click to copy"}</span>
            </button>

            <div className="button-grid-items">
                {otherButtons.map((button) => {
                    const fileName = decodeURIComponent(button.src.split("/").pop() || "button");
                    if (button.iframe) {
                        return (
                            <iframe
                                key={button.src}
                                src={button.src}
                                width={88}
                                height={31}
                                title="Hazel's visitor counter"
                                loading="lazy"
                            />
                        );
                    }

                    const image = (
                        <img
                            key={button.src}
                            src={button.src}
                            width={88}
                            height={31}
                            alt={fileName.replace(/\.[^.]+$/, "")}
                            loading="lazy"
                        />
                    );

                    return button.href ? (
                        <a href={button.href} target="_blank" rel="noreferrer" key={button.src}>
                            {image}
                        </a>
                    ) : (
                        <span className="button-image" key={button.src}>
                            {image}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}

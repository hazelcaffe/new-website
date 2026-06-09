import { useEffect, useState } from "react";

type Button = {
    src: string;
    href: string | null;
};

export default function ButtonGrid() {
    const [buttons, setButtons] = useState<Button[] | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
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
    }, []);

    if (failed) {
        return <span className="button-grid-message">could not load buttons</span>;
    }

    if (!buttons) {
        return <span className="button-grid-message">loading buttons...</span>;
    }

    if (!buttons.length) {
        return <span className="button-grid-message">no buttons yet</span>;
    }

    return (
        <>
            {buttons.map((button) => {
                const fileName = decodeURIComponent(button.src.split("/").pop() || "button");
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
        </>
    );
}

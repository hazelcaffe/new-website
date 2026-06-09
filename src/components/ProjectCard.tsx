import { useEffect, useState } from "react";

type Props = {
    demo: string | null;
    description: string;
    image: string | null;
    name: string;
    repo: string | null;
    showStars: boolean;
};

/**
 * Renders one configured project and optionally enriches it with a cached GitHub star count.
 */
export default function ProjectCard(props: Props) {
    const [stars, setStars] = useState<number | null>(null);

    useEffect(
        /**
         * Avoids GitHub traffic for cards that do not explicitly opt into star counts.
         */
        function loadStars() {
            if (!props.repo || !props.showStars) return;
            const repository = new URL(props.repo).pathname.replace(/^\/|\/$/g, "");
            fetch(`/api/github-stars?repo=${encodeURIComponent(repository)}`)
                .then((response) => (response.ok ? response.json() : Promise.reject()))
                .then((data) => setStars(data.stars))
                .catch(() => setStars(null));
        },
        [props.repo, props.showStars]
    );

    return (
        <article className={`window project-card${props.image ? " project-card-featured" : ""}`}>
            {props.image ? (
                <div className="project-image-wrap">
                    <img
                        className="project-image"
                        src={props.image}
                        alt={`Preview of ${props.name}`}
                        loading="lazy"
                    />
                </div>
            ) : (
                <div className="project-placeholder" aria-hidden="true">
                    <span>&lt;/&gt;</span>
                </div>
            )}
            <div className="window-body project-card-body">
                <div className="project-copy">
                    <p className="project-label">project</p>
                    <h2>{props.name}</h2>
                    <p>{props.description}</p>
                </div>
                <div className="project-links">
                    {props.demo && (
                        <a href={props.demo} target="_blank" rel="noreferrer">
                            <span aria-hidden="true">↗</span> Demo
                        </a>
                    )}
                    {props.repo && (
                        <a href={props.repo} target="_blank" rel="noreferrer">
                            <span aria-hidden="true">&lt;/&gt;</span> Repository
                            {stars !== null && <small>{stars} ★</small>}
                        </a>
                    )}
                </div>
            </div>
        </article>
    );
}

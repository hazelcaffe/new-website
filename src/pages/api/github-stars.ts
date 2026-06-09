import type { APIRoute } from "astro";
import { withCache } from "../../lib/cache";

const repositoryPattern = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

/**
 * Fetches only the public count needed by project cards to keep the response small.
 */
async function loadStarCount(repository: string): Promise<number> {
    const upstream = await fetch(`https://api.github.com/repos/${repository}`, {
        headers: {
            Accept: "application/vnd.github+json",
            "User-Agent": "qwq.sh"
        }
    });
    if (!upstream.ok) throw new Error(`GitHub returned HTTP ${upstream.status}`);
    const payload = await upstream.json();
    return Number(payload.stargazers_count) || 0;
}

/**
 * Validates repository names before proxying requests to GitHub and caches successful counts.
 */
export const GET: APIRoute = async ({ url }) => {
    const repository = url.searchParams.get("repo") || "";
    if (!repositoryPattern.test(repository)) {
        return Response.json({ error: "Invalid repository." }, { status: 400 });
    }

    try {
        const stars = await withCache(`github-stars:${repository}`, 15 * 60_000, () =>
            loadStarCount(repository)
        );

        return Response.json(
            { repository, stars },
            { headers: { "Cache-Control": "public, max-age=900" } }
        );
    } catch (error) {
        console.error("GitHub stars error:", error);
        return Response.json({ error: "GitHub stars are unavailable." }, { status: 502 });
    }
};

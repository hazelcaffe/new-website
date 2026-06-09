/**
 * Builds a Last.fm URL while preserving the service's plus-delimited path convention.
 */
export function lastfmUrl(...parts: Array<string | null | undefined>): string {
    const encodedParts = parts
        .filter((part): part is string => Boolean(part))
        .map((part) => encodeURIComponent(part).replaceAll("%20", "+"));

    return encodedParts.length
        ? `https://www.last.fm/music/${encodedParts.join("/")}`
        : "https://www.last.fm";
}

/**
 * Selects the largest non-empty image because Last.fm orders artwork from small to large.
 */
export function getLargestImage(images: Array<{ "#text"?: string }> = []): string | null {
    return [...images].reverse().find((image) => image["#text"])?.["#text"] || null;
}

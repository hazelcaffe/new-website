export function lastfmUrl(...parts: Array<string | null | undefined>): string {
    const encodedParts = parts
        .filter((part): part is string => Boolean(part))
        .map((part) => encodeURIComponent(part).replaceAll("%20", "+"));

    return encodedParts.length
        ? `https://www.last.fm/music/${encodedParts.join("/")}`
        : "https://www.last.fm";
}

export function getLargestImage(images: Array<{ "#text"?: string }> = []) {
    return [...images].reverse().find((image) => image["#text"])?.["#text"] || null;
}

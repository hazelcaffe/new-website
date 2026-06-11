import type { CollectionEntry } from "astro:content";
import site from "../config/site.json";
export type BlogPost = CollectionEntry<"posts">;

export const blogDescription = "I like writing sometimes :p";

export function sortPosts(posts: BlogPost[]): BlogPost[] {
    return posts.toSorted((left, right) => right.data.date.getTime() - left.data.date.getTime());
}

export function postPath(post: BlogPost): string {
    return `/blog/${post.id.replace(/\.(md|mdx)$/i, "")}`;
}

export function absoluteUrl(pathname: string): string {
    return new URL(pathname, site.meta.siteUrl).toString();
}

export function formatPostDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC"
    }).format(date);
}

export function escapeXml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");
}

import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import site from "../config/site.json";
import { absoluteUrl, blogDescription, escapeXml, postPath, sortPosts } from "../lib/blog";

export const GET: APIRoute = async () => {
    const posts = sortPosts(await getCollection("posts"));
    const updated = posts[0]?.data.date.toISOString() ?? new Date(0).toISOString();
    const entries = posts
        .map((post) => {
            const url = absoluteUrl(postPath(post));
            return `<entry>
    <title>${escapeXml(post.data.title)}</title>
    <id>${url}</id>
    <link href="${url}" />
    <published>${post.data.date.toISOString()}</published>
    <updated>${post.data.date.toISOString()}</updated>
    <summary>${escapeXml(post.data.subtitle)}</summary>
    <content type="html">${escapeXml(post.rendered?.html ?? "")}</content>
    ${post.data.tags.map((tag) => `<category term="${escapeXml(tag)}" />`).join("")}
</entry>`;
        })
        .join("\n");

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
    <title>${escapeXml(`${site.person.name}'s Blog`)}</title>
    <id>${absoluteUrl("/blog")}</id>
    <link href="${absoluteUrl("/blog")}" />
    <link href="${absoluteUrl("/atom.xml")}" rel="self" />
    <updated>${updated}</updated>
    <subtitle>${escapeXml(blogDescription)}</subtitle>
    <author><name>${escapeXml(site.person.name)}</name></author>
    ${entries}
</feed>`;

    return new Response(body, {
        headers: { "Content-Type": "application/atom+xml; charset=utf-8" }
    });
};

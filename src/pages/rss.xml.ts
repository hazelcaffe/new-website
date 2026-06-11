import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import site from "../config/site.json";
import { absoluteUrl, blogDescription, escapeXml, postPath, sortPosts } from "../lib/blog";

export const GET: APIRoute = async () => {
    const posts = sortPosts(await getCollection("posts"));
    const items = posts
        .map((post) => {
            const url = absoluteUrl(postPath(post));
            const tags = post.data.tags
                .map((tag) => `<category>${escapeXml(tag)}</category>`)
                .join("");
            const content = post.rendered?.html?.replaceAll("]]>", "]]]]><![CDATA[>") ?? "";

            return `<item>
    <title>${escapeXml(post.data.title)}</title>
    <link>${url}</link>
    <guid isPermaLink="true">${url}</guid>
    <pubDate>${post.data.date.toUTCString()}</pubDate>
    <description>${escapeXml(post.data.subtitle)}</description>
    <content:encoded><![CDATA[${content}]]></content:encoded>
    ${tags}
</item>`;
        })
        .join("\n");

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
    <title>${escapeXml(`${site.person.name}'s Blog`)}</title>
    <link>${absoluteUrl("/blog")}</link>
    <description>${escapeXml(blogDescription)}</description>
    <language>en-us</language>
    <atom:link href="${absoluteUrl("/rss.xml")}" rel="self" type="application/rss+xml" />
    ${items}
</channel>
</rss>`;

    return new Response(body, {
        headers: { "Content-Type": "application/rss+xml; charset=utf-8" }
    });
};

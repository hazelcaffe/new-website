import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import site from "../config/site.json";
import { absoluteUrl, blogDescription, postPath, sortPosts } from "../lib/blog";

export const GET: APIRoute = async () => {
    const posts = sortPosts(await getCollection("posts"));
    const feedUrl = absoluteUrl("/feed.json");

    return Response.json(
        {
            version: "https://jsonfeed.org/version/1.1",
            title: `${site.person.name}'s Blog`,
            home_page_url: absoluteUrl("/blog"),
            feed_url: feedUrl,
            description: blogDescription,
            authors: [{ name: site.person.name, url: site.meta.siteUrl }],
            items: posts.map((post) => ({
                id: absoluteUrl(postPath(post)),
                url: absoluteUrl(postPath(post)),
                title: post.data.title,
                summary: post.data.subtitle,
                content_html: post.rendered?.html ?? "",
                image: post.data.image ? absoluteUrl(post.data.image) : undefined,
                date_published: post.data.date.toISOString(),
                tags: post.data.tags
            }))
        },
        {
            headers: { "Content-Type": "application/feed+json; charset=utf-8" }
        }
    );
};

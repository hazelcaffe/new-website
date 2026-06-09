import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { markdownLinks } from "./src/lib/markdown-links";

export default defineConfig({
    site: "https://qwq.sh",
    output: "server",
    adapter: node({ mode: "standalone" }),
    integrations: [sitemap()],
    markdown: {
        rehypePlugins: [markdownLinks]
    },
    vite: {
        plugins: [tailwindcss()]
    }
});

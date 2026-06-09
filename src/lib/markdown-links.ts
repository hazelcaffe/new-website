import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";

/**
 * Protects visitors from losing the site when following links rendered from Markdown.
 */
function openExternalLinks(tree: Root): void {
    visit(tree, "element", (node: Element) => {
        if (node.tagName !== "a") return;

        node.properties.target = "_blank";
        node.properties.rel = ["noopener", "noreferrer"];
    });
}

/**
 * Exposes the external-link transformer in the plugin shape expected by Astro.
 */
export function markdownLinks(): (tree: Root) => void {
    return openExternalLinks;
}

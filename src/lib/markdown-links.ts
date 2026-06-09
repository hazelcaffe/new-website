import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";

export function markdownLinks() {
    return (tree: Root) => {
        visit(tree, "element", (node: Element) => {
            if (node.tagName !== "a") return;

            node.properties.target = "_blank";
            node.properties.rel = ["noopener", "noreferrer"];
        });
    };
}

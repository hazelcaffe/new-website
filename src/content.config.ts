import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const datePattern = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])-(\d{4})$/;

function parsePostDate(value: string): Date {
    const match = datePattern.exec(value);
    if (!match) {
        throw new Error("Post dates must use MM-DD-YYYY.");
    }

    const [, month, day, year] = match;
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    if (
        date.getUTCFullYear() !== Number(year) ||
        date.getUTCMonth() !== Number(month) - 1 ||
        date.getUTCDate() !== Number(day)
    ) {
        throw new Error(`"${value}" is not a valid calendar date.`);
    }

    return date;
}

const posts = defineCollection({
    loader: glob({ base: "./src/content/posts", pattern: "**/*.{md,mdx}" }),
    schema: z.object({
        title: z.string().min(1),
        subtitle: z.string().min(1),
        date: z.string().regex(datePattern).transform(parsePostDate),
        tags: z
            .union([z.string(), z.array(z.string())])
            .optional()
            .transform((tags) => {
                if (!tags) return [];
                return (Array.isArray(tags) ? tags : tags.split(","))
                    .map((tag) => tag.trim())
                    .filter(Boolean);
            }),
        image: z.string().startsWith("/").optional()
    })
});

export const collections = { posts };

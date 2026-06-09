import { readFile } from "node:fs/promises";
import path from "node:path";
import type { APIRoute } from "astro";
import mime from "mime-types";
import { buttonsDirectory } from "../../../lib/paths";

export const GET: APIRoute = async ({ params }) => {
    const file = params.file;

    if (!file || file !== path.basename(file)) {
        return new Response(null, { status: 404 });
    }

    try {
        const body = await readFile(path.join(buttonsDirectory, file));
        return new Response(body, {
            headers: {
                "Cache-Control": "public, max-age=3600",
                "Content-Type": mime.lookup(file) || "application/octet-stream"
            }
        });
    } catch (error) {
        const code = (error as NodeJS.ErrnoException).code;
        return new Response(null, { status: code === "ENOENT" ? 404 : 500 });
    }
};

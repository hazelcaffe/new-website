import { readdir } from "node:fs/promises";
import configuredButtons from "../config/buttons.json";
import { buttonsDirectory } from "./paths";

export type Button = {
    src: string;
    href: string | null;
    iframe: boolean;
    alt?: string;
};

type ConfiguredButton = {
    file?: string;
    src?: string;
    href: string | null;
    iframe?: boolean;
    alt?: string;
};

/**
 * Preserves configured button order while still exposing newly added unconfigured files.
 */
export async function loadButtons(): Promise<Button[]> {
    try {
        const entries = await readdir(buttonsDirectory, { withFileTypes: true });
        const available = new Set(
            entries.filter((entry) => entry.isFile()).map((entry) => entry.name)
        );
        const configured = (configuredButtons as ConfiguredButton[]).flatMap((button) => {
            if (button.src) {
                return [
                    {
                        src: button.src,
                        href: button.href,
                        iframe: button.iframe ?? false,
                        alt: button.alt
                    }
                ];
            }

            if (button.file && available.delete(button.file)) {
                return [
                    {
                        src: `/88x31/${encodeURIComponent(button.file)}`,
                        href: button.href,
                        iframe: button.iframe ?? false
                    }
                ];
            }

            return [];
        });
        const remaining = [...available].sort().map((file) => ({
            src: `/88x31/${encodeURIComponent(file)}`,
            href: null,
            iframe: false
        }));

        return [...configured, ...remaining];
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
        throw error;
    }
}

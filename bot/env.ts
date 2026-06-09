import "dotenv/config";

/**
 * Rejects partial bot configuration before Discord receives an invalid authentication request.
 */
function required(name: string): string {
    const value = process.env[name]?.trim();
    if (!value) throw new Error(`Missing required environment variable: ${name}`);
    return value;
}

export const botEnv = {
    APP_ID: required("APP_ID"),
    BOT_TOKEN: required("BOT_TOKEN"),
    OWNER_UID: required("OWNER_UID")
};

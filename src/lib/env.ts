import "dotenv/config";

/**
 * Fails during startup because partially configured API routes cannot operate safely.
 */
function required(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`Missing required environment variable: ${name}`);
    return value;
}

export const env = {
    DISCORD_USER_ID: required("DISCORD_USER_ID"),
    LASTFM_API_KEY: required("LASTFM_API_KEY"),
    LASTFM_USERNAME: required("LASTFM_USERNAME"),
    TRUST_PROXY: process.env.TRUST_PROXY !== "false"
};

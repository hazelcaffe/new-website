import {
    AttachmentBuilder,
    type ChatInputCommandInteraction,
    Client,
    Events,
    GatewayIntentBits,
    type Interaction,
    MessageFlags
} from "discord.js";
import { addShortUrl, listShortUrls, removeShortUrl, setLastUpdate } from "../src/lib/site-data";
import { botEnv } from "./env";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

/**
 * Preserves command context in unauthorized-use alerts without exposing Discord's raw payload.
 */
function describeCommand(interaction: ChatInputCommandInteraction): string {
    const values = interaction.options.data.flatMap((option) => {
        if (option.options) {
            return option.options
                .filter((nested) => nested.value !== undefined)
                .map((nested) => `${nested.name}:"${String(nested.value)}"`);
        }
        return option.value === undefined ? [] : [`${option.name}:"${String(option.value)}"`];
    });
    return `/${interaction.commandName}${values.length ? ` ${values.join(" ")}` : ""}`;
}

/**
 * Alerts the owner because user-installed commands can be invoked outside the owner's servers.
 */
async function notifyUnauthorized(interaction: ChatInputCommandInteraction): Promise<void> {
    const owner = await client.users.fetch(botEnv.OWNER_UID);
    await owner.send(`<@${interaction.user.id}> tried to run ${describeCommand(interaction)}`);
}

/**
 * Keeps administrative data private by default while retaining an explicit public override.
 */
async function reply(
    interaction: ChatInputCommandInteraction,
    content: string,
    files: AttachmentBuilder[] = []
): Promise<void> {
    const hidden = interaction.options.getBoolean("hidden") ?? true;
    await interaction.reply({
        content,
        files,
        flags: hidden ? MessageFlags.Ephemeral : undefined
    });
}

/**
 * Keeps URL summaries compact enough for routine command responses.
 */
async function formatUrlList(): Promise<string> {
    const urls = await listShortUrls();
    if (urls.length === 0) return "No shortened URLs exist.";
    return urls
        .map(
            (record) =>
                `• https://qwq.sh/${record.vanity} → ${record.url} (${record.visits.length} visits)`
        )
        .join("\n");
}

/**
 * Produces a plain-text audit record that can also be sent as an attachment when it is large.
 */
async function formatUrlDetails(vanity: string): Promise<string | null> {
    const record = (await listShortUrls()).find((entry) => entry.vanity === vanity.toLowerCase());
    if (!record) return null;

    const visits =
        record.visits.length === 0
            ? "No visits."
            : record.visits
                  .map(
                      (visit, index) =>
                          `${index + 1}. ${visit.visitedAt}\nIP: ${visit.ip}\nUA: ${visit.userAgent}`
                  )
                  .join("\n\n");

    return [
        `Vanity: https://qwq.sh/${record.vanity}`,
        `URL: ${record.url}`,
        `Created: ${record.createdAt}`,
        `Total visits: ${record.visits.length}`,
        "",
        visits
    ].join("\n");
}

/**
 * Keeps profile updates behind the same owner authorization as URL administration.
 */
async function handleUpdate(interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString("text", true);
    const update = await setLastUpdate(text);
    await reply(interaction, `Updated the website:\n${update.text}`);
}

/**
 * Centralizes URL administration so all subcommands share validation and privacy behavior.
 */
async function handleUrls(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "list") {
        const list = await formatUrlList();
        if (list.length <= 1900) {
            await reply(interaction, list);
        } else {
            const attachment = new AttachmentBuilder(Buffer.from(list), {
                name: "short-urls.txt"
            });
            await reply(interaction, "Shortened URL list:", [attachment]);
        }
        return;
    }

    const vanity = interaction.options.getString("vanity", true);
    if (subcommand === "add") {
        const url = interaction.options.getString("url", true);
        const record = await addShortUrl(vanity, url);
        await reply(interaction, `Created https://qwq.sh/${vanity.toLowerCase()} → ${record.url}`);
        return;
    }

    if (subcommand === "rm") {
        const removed = await removeShortUrl(vanity);
        await reply(
            interaction,
            removed ? `Removed https://qwq.sh/${vanity.toLowerCase()}` : `Unknown vanity: ${vanity}`
        );
        return;
    }

    const details = await formatUrlDetails(vanity);
    if (!details) {
        await reply(interaction, `Unknown vanity: ${vanity}`);
        return;
    }

    if (details.length <= 1900) {
        await reply(interaction, `\`\`\`\n${details}\n\`\`\``);
        return;
    }

    const attachment = new AttachmentBuilder(Buffer.from(details), {
        name: `${vanity.toLowerCase()}-visits.txt`
    });
    await reply(interaction, `Details for https://qwq.sh/${vanity.toLowerCase()}`, [attachment]);
}

/**
 * Confirms the authenticated identity because deploying and running may use different tokens.
 */
function handleReady(readyClient: Client<true>): void {
    console.log(`Logged in as ${readyClient.user.tag}.`);
}

/**
 * Limits autocomplete to owner-visible records and Discord's 25-choice maximum.
 */
async function handleAutocomplete(interaction: Interaction): Promise<void> {
    if (!interaction.isAutocomplete()) return;

    if (interaction.user.id !== botEnv.OWNER_UID) {
        await interaction.respond([]);
        return;
    }

    const focused = interaction.options.getFocused().toLowerCase();
    const urls = await listShortUrls();
    await interaction.respond(
        urls
            .filter((record) => record.vanity.includes(focused))
            .slice(0, 25)
            .map((record) => ({ name: record.vanity, value: record.vanity }))
    );
}

/**
 * Routes interactions through owner authorization before any administrative side effect.
 */
async function handleInteraction(interaction: Interaction): Promise<void> {
    if (interaction.isAutocomplete()) {
        await handleAutocomplete(interaction);
        return;
    }

    if (!interaction.isChatInputCommand()) return;

    if (interaction.user.id !== botEnv.OWNER_UID) {
        await notifyUnauthorized(interaction).catch((error) =>
            console.error("Could not notify owner:", error)
        );
        await interaction.reply({
            content: "This command is restricted to the application owner.",
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    try {
        if (interaction.commandName === "update") {
            await handleUpdate(interaction);
        } else if (interaction.commandName === "urls") {
            await handleUrls(interaction);
        }
    } catch (error) {
        console.error("Command error:", error);
        const message = error instanceof Error ? error.message : "The command failed.";
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: message, flags: MessageFlags.Ephemeral });
        } else {
            await interaction.reply({ content: message, flags: MessageFlags.Ephemeral });
        }
    }
}

client.once(Events.ClientReady, handleReady);
client.on(Events.InteractionCreate, handleInteraction);

await client.login(botEnv.BOT_TOKEN);

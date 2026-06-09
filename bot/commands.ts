import {
    ApplicationIntegrationType,
    InteractionContextType,
    SlashCommandBuilder
} from "discord.js";

const updateCommand = new SlashCommandBuilder()
    .setName("update")
    .setDescription("Update the website's Last update text")
    .addStringOption((option) =>
        option.setName("text").setDescription("The update to publish").setRequired(true)
    )
    .addBooleanOption((option) =>
        option.setName("hidden").setDescription("Only show the response to you (default: true)")
    );

const urlsCommand = new SlashCommandBuilder()
    .setName("urls")
    .setDescription("Manage qwq.sh shortened URLs")
    .addSubcommand((subcommand) =>
        subcommand
            .setName("list")
            .setDescription("List all shortened URLs")
            .addBooleanOption((option) =>
                option
                    .setName("hidden")
                    .setDescription("Only show the response to you (default: true)")
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("add")
            .setDescription("Create a shortened URL")
            .addStringOption((option) =>
                option.setName("url").setDescription("The full destination URL").setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName("vanity")
                    .setDescription("The qwq.sh path to create")
                    .setRequired(true)
            )
            .addBooleanOption((option) =>
                option
                    .setName("hidden")
                    .setDescription("Only show the response to you (default: true)")
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("rm")
            .setDescription("Remove a shortened URL")
            .addStringOption((option) =>
                option
                    .setName("vanity")
                    .setDescription("The vanity to remove")
                    .setRequired(true)
                    .setAutocomplete(true)
            )
            .addBooleanOption((option) =>
                option
                    .setName("hidden")
                    .setDescription("Only show the response to you (default: true)")
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("view")
            .setDescription("View a shortened URL and its visitors")
            .addStringOption((option) =>
                option
                    .setName("vanity")
                    .setDescription("The vanity to inspect")
                    .setRequired(true)
                    .setAutocomplete(true)
            )
            .addBooleanOption((option) =>
                option
                    .setName("hidden")
                    .setDescription("Only show the response to you (default: true)")
            )
    );

/**
 * Registers commands for user installation so the owner can use them outside a specific guild.
 */
export const commandData = [updateCommand, urlsCommand].map((command) => ({
    ...command.toJSON(),
    integration_types: [ApplicationIntegrationType.UserInstall],
    contexts: [
        InteractionContextType.Guild,
        InteractionContextType.BotDM,
        InteractionContextType.PrivateChannel
    ]
}));

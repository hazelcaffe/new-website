import { REST, Routes } from "discord.js";
import { commandData } from "./commands";
import { botEnv } from "./env";

/**
 * Replaces global definitions so removed or renamed commands cannot linger in Discord.
 */
async function deployCommands(): Promise<void> {
    const rest = new REST({ version: "10" }).setToken(botEnv.BOT_TOKEN);
    await rest.put(Routes.applicationCommands(botEnv.APP_ID), {
        body: commandData
    });
    console.log(`Deployed ${commandData.length} global commands.`);
}

await deployCommands();

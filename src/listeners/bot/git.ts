// Dependencies
import channelConfig from "../../util/schemas/config/channel.js";

import AutoGitUpdate from "auto-git-update";
import { Cron } from "croner";

import { Listener } from "@sapphire/framework";
import { Client, TextChannel, EmbedBuilder } from "discord.js";

// Env
import { config } from "dotenv";
config();

export default class extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "ready",
        });
    }

    async run(client: Client) {
        // Global Variables
        let pendingRestart: Boolean = false;

        const updateChecker = Cron("*/2 * * * * *", async () => {
            // Updater
            const updaterConfig = {
                repository: `${process.env.GITHUB_URL}`,
                fromReleases: true,
                tempLocation: "/tmp",
                token: `${process.env.GITHUB_TOKEN}`,
                logConfig: {
                    logGeneral: false,
                },
            };
            const updater = new AutoGitUpdate(updaterConfig);

            // Variables
            const currentVer = await updater.compareVersions();

            // Channels
            const botLogsChannel = await channelConfig.findOne({
                channel_key: "botupdatelogs",
            });
            const fetchedBotLogsChannel = client.channels.cache.find(
                (c) => c.id === botLogsChannel?.channel_id
            ) as TextChannel;
            const qvgkUser = client.users.cache.find(
                (u) => u.username === "qvgk"
            );

            if (!pendingRestart && !currentVer.upToDate) {
                // Set Updating Value
                pendingRestart = true;

                // Embeds
                const updateEmbed = new EmbedBuilder()
                    .setTitle("New Bot Update")
                    .addFields(
                        {
                            name: "Current Version",
                            value: `\`${currentVer.currentVersion}\``,
                            inline: true,
                        },
                        {
                            name: "Latest Version",
                            value: `\`${currentVer.remoteVersion}\``,
                            inline: true,
                        },
                        {
                            name: " ",
                            value: "The bot is now pending a restart to apply the update.",
                        }
                    )
                    .setColor("#44f9fa");

                console.log("New GitHub Release. Updating...");
                await updater.autoUpdate();

                // Update Messages + Updater
                if (fetchedBotLogsChannel) {
                    await fetchedBotLogsChannel.send({
                        content: `${qvgkUser || " "}`,
                        embeds: [updateEmbed],
                    });
                }

                console.log("Bot Updated. Pending restart.");
            }
        });
    }
}

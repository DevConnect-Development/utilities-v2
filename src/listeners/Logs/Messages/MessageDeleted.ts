// Dependencies
import globalConfig from "../../../config.js";
import removeQueries from "../../../util/modules/removeQueries.js";

import { Listener } from "@sapphire/framework";
import { Message, TextChannel, EmbedBuilder } from "discord.js";

// Schemas
import ChannelConfig from "../../../util/schemas/config/channel.js";

export default class extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "messageDelete",
        });
    }

    async run(message: Message) {
        // Guild ID Check
        if (message.guild?.id !== globalConfig.communityGuild) return;

        // Logs Channel
        const messageLogs = await ChannelConfig.findOne({
            guild_id: globalConfig.staffGuild,
            channel_key: "message_logs",
        });
        const messageLogsChannel = this.container.client.channels.cache.find(
            (c) => c.id === messageLogs?.channel_id
        ) as TextChannel;

        // Channel Validity Check
        if (!messageLogs || !messageLogsChannel) return;

        // Length Check
        if (message.content.length >= 1024 || message.author.bot) {
            return;
        }

        // Embeds
        const logEmbed = new EmbedBuilder()
            .setAuthor({
                name: `${message.author.username} (${message.author.id})`,
                iconURL: `${
                    message.member?.displayAvatarURL() ||
                    message.author.displayAvatarURL()
                }`,
            })
            .addFields({
                name: "Deleted Message",
                value: [
                    `Channel: ${message.url}`,
                    `Created: <t:${Math.round(
                        message.createdTimestamp / 1000
                    )}:f>`,
                ].join("\n"),
            })
            .setColor("Red")
            .setFooter({
                text: `ID: ${message.id}`,
            })
            .setTimestamp();

        // Extra Checks
        if (message.content.length > 0) {
            logEmbed.addFields({
                name: "Message Content",
                value: `\`\`\`${message.content}\`\`\``,
            });
        }

        // Attachments Check
        if (message.attachments.size > 0) {
            const formatted = message.attachments.map((a) => {
                const newURL = removeQueries(a.url);
                return `[${newURL.hostnameURL}](${newURL.cleanURL})`;
            });

            if (formatted.join("\n").length < 1024) {
                logEmbed.addFields({
                    name: "Attachments",
                    value: formatted.join("\n"),
                });
            }
        }

        // Send Log
        return await messageLogsChannel.send({
            embeds: [logEmbed]
        });
    }
}

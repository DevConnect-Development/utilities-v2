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
            event: "messageUpdate",
        });
    }

    async run(oldmessage: Message, newmessage: Message) {
        // Guild ID Check
        if (newmessage.guild?.id !== globalConfig.communityGuild) return;

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
        if (
            oldmessage.content === newmessage.content ||
            oldmessage.content.length >= 1000 ||
            newmessage.content.length >= 1000 ||
            newmessage.author.bot
        ) {
            return;
        }

        // Embeds
        const logEmbed = new EmbedBuilder()
            .setAuthor({
                name: `${newmessage.author.username} (${newmessage.author.id})`,
                iconURL: `${
                    newmessage.member?.displayAvatarURL() ||
                    newmessage.author.displayAvatarURL()
                }`,
            })
            .addFields(
                {
                    name: "Updated Message",
                    value: [
                        `Channel: ${newmessage.url}`,
                        `Created: <t:${Math.round(
                            newmessage.createdTimestamp / 1000
                        )}:f>`,
                    ].join("\n"),
                },
                {
                    name: "Old Message Content",
                    value: `\`\`\`${oldmessage.content}\`\`\``,
                },
                {
                    name: "New Message Content",
                    value: `\`\`\`${newmessage.content}\`\`\``,
                }
            )
            .setColor("#eb8654")
            .setFooter({
                text: `ID: ${newmessage.id}`,
            })
            .setTimestamp();

        // Attachments Check
        if (newmessage.attachments.size > 0) {
            const formatted = newmessage.attachments.map((a) => {
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
            embeds: [logEmbed],
        });
    }
}

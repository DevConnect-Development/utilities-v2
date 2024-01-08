// Dependencies
import ChannelConfig from "../../util/schemas/config/channel.js";
import { createUserSelect } from "../../util/services/UserService/index.js";

import { Listener } from "@sapphire/framework";
import { Message, TextChannel, EmbedBuilder } from "discord.js";

export default class extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "messageUpdate",
        });
    }

    async run(oldmessage: Message, newmessage: Message) {
        // Server Check
        if (!newmessage.inGuild()) {
            return;
        }

        // Variables
        const messageLogsChannel = await ChannelConfig.findOne({
            channel_key: "messagelogs",
        });
        const fetchedMsgLogsChannel = newmessage.guild.channels.cache.find(
            (c) => c.id === messageLogsChannel?.channel_id
        ) as TextChannel;

        // Channel Validity Check
        if (!messageLogsChannel || !fetchedMsgLogsChannel) {
            return;
        }

        // Length Check
        if (
            oldmessage.content.length >= 1000 ||
            newmessage.content.length >= 1000 ||
            newmessage.author.bot
        ) {
            return;
        }

        // Embeds
        const userSelect = createUserSelect([
            {
                name: `${newmessage.author.username} (${newmessage.author.id})`,
                userid: newmessage.author.id,
                description: "The Message Author",
            },
        ]);

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

        // Message Checks
        if (!fetchedMsgLogsChannel) {
            return;
        }
        if (oldmessage.content === newmessage.content) {
            return;
        }

        return await fetchedMsgLogsChannel.send({
            embeds: [logEmbed],
            components: [userSelect],
        });
    }
}

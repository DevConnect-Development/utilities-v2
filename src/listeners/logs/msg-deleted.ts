// Dependencies
import ChannelConfig from "../../util/schemas/config/channel.js";
import { createUserSelect } from "../../util/services/UserService/index.js";

import { Listener } from "@sapphire/framework";
import { Message, TextChannel, EmbedBuilder } from "discord.js";

export default class extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "messageDelete",
        });
    }

    async run(message: Message) {
        // Server Check
        if (!message.inGuild()) {
            return;
        }

        // Variables
        const messageLogsChannel = await ChannelConfig.findOne({
            channel_key: "messagelogs",
        });
        const fetchedMsgLogsChannel = message.guild.channels.cache.find(
            (c) => c.id === messageLogsChannel?.channel_id
        ) as TextChannel;

        // Channel Validity Check
        if (!messageLogsChannel || !fetchedMsgLogsChannel) {
            return;
        }

        // Length Check
        if (message.content.length >= 1000 || message.author.bot) {
            return;
        }

        // Embeds
        const userSelect = createUserSelect([
            {
                name: `${message.author.username} (${message.author.id})`,
                userid: message.author.id,
                description: "The Message Author",
            },
        ]);

        const logEmbed = new EmbedBuilder()
            .setAuthor({
                name: `${message.author.username} (${message.author.id})`,
                iconURL: `${
                    message.member?.displayAvatarURL() ||
                    message.author.displayAvatarURL()
                }`,
            })
            .addFields(
                {
                    name: "Deleted Message",
                    value: [
                        `Channel: ${message.url}`,
                        `Created: <t:${Math.round(
                            message.createdTimestamp / 1000
                        )}:f>`,
                    ].join("\n"),
                },
                {
                    name: "Message Content",
                    value: `\`\`\`${message.content}\`\`\``,
                }
            )
            .setColor("Red")
            .setFooter({
                text: `ID: ${message.id}`,
            })
            .setTimestamp();

        // Message Checks
        if (!fetchedMsgLogsChannel) {
            return;
        }
        if (message.author.bot) {
            return;
        }

        return await fetchedMsgLogsChannel.send({
            embeds: [logEmbed],
            components: [userSelect],
        });
    }
}

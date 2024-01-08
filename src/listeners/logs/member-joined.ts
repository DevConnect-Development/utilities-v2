// Dependencies
import ChannelConfig from "../../util/schemas/config/channel.js";
import { createUserSelect } from "../../util/services/UserService/index.js";

import { Listener } from "@sapphire/framework";
import { GuildMember, TextChannel, EmbedBuilder } from "discord.js";

export default class extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "guildMemberAdd",
        });
    }

    async run(member: GuildMember) {
        // Variables
        const joinlogsChannel = await ChannelConfig.findOne({
            channel_key: "joinlogs",
        });
        const fetchedJoinLogsChannel = member.guild.channels.cache.find(
            (c) => c.id === joinlogsChannel?.channel_id
        ) as TextChannel;

        // Channel Validity Check
        if (!joinlogsChannel || !fetchedJoinLogsChannel) {
            return;
        }

        // Components
        const userSelect = createUserSelect(
            [
                {
                    name: `${member.user.username} (${member.user.id})`,
                    userid: member.user.id,

                    description: "Current Account",
                },
            ],
            "Alt Accounts List"
        );

        // Embeds
        const logEmbed = new EmbedBuilder()
            .setAuthor({
                name: `${member.user.username} (${member.user.id})`,
                iconURL: `${
                    member.displayAvatarURL() || member.user.displayAvatarURL()
                }`,
            })
            .addFields({
                name: "A New User Has Joined",
                value: [
                    `User: ${member.user}`,
                    `Account Created: <t:${Math.round(
                        member.user.createdTimestamp / 1000
                    )}>`,
                ].join("\n"),
            })
            .setColor("Green")
            .setTimestamp();

        return await fetchedJoinLogsChannel.send({
            embeds: [logEmbed],
            components: [userSelect],
        });
    }
}

// Dependencies
import globalConfig from "../../../config.js";

import { Listener } from "@sapphire/framework";
import { GuildMember, TextChannel, EmbedBuilder } from "discord.js";

// Schemas
import ChannelConfig from "../../../util/schemas/Config/ChannelConfig.js";

export default class extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "guildMemberAdd",
        });
    }

    async run(member: GuildMember) {
        // Guild ID Check
        if (member.guild.id !== globalConfig.communityGuild) return;

        // Logs Channel
        const memberLogs = await ChannelConfig.findOne({
            guild_id: globalConfig.staffGuild,
            channel_key: "member_logs",
        });
        const memberLogsChannel = this.container.client.channels.cache.find(
            (c) => c.id === memberLogs?.channel_id
        ) as TextChannel;

        // Channel Validity Check
        if (!memberLogs || !memberLogsChannel) return;

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

        // Send Log
        return await memberLogsChannel.send({
            embeds: [logEmbed],
        });
    }
}

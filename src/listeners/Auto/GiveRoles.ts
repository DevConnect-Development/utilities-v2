// Dependencies
import globalConfig from "@config";

import { Listener } from "@sapphire/framework";
import { GuildMember } from "discord.js";

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

        // Variables
        const memberRole = member.guild.roles.cache.find(
            (r) => r.name === "Member"
        );

        // Dividers
        const skillsDivider = member.guild.roles.cache.find(
            (r) => r.id === "1205472641704792084"
        );
        const miscDivider = member.guild.roles.cache.find(
            (r) => r.id === "1162998861799903256"
        );
        const optionalDivider = member.guild.roles.cache.find(
            (r) => r.id === "1162998909665296464"
        );

        // Check
        if (!memberRole || !skillsDivider || !miscDivider || !optionalDivider) {
            return;
        }

        // Give Role
        await member.roles.add(memberRole);
        await member.roles.add(skillsDivider);
        await member.roles.add(miscDivider);
        await member.roles.add(optionalDivider);
    }
}

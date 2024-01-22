// Dependencies
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
        // Variables
        const memberRole = member.guild.roles.cache.find(
            (r) => r.name === "Member"
        );

        // Dividers
        const membersDivider = member.guild.roles.cache.find(
            (r) => r.id === "1162998861799903256"
        );
        const optionalDivider = member.guild.roles.cache.find(
            (r) => r.id === "1162998909665296464"
        );

        // Check
        if (!memberRole || !membersDivider || !optionalDivider) {
            return;
        }

        // Give Role
        await member.roles.add(memberRole);
        await member.roles.add(membersDivider);
        await member.roles.add(optionalDivider);
    }
}

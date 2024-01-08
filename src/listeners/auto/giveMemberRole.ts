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

        // Check
        if(!memberRole) {
            return;
        }

        // Give Role
        await member.roles.add(memberRole)
    }
}

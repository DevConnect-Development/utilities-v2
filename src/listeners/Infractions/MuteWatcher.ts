// Dependencies
import { Cron } from "croner";
import moment from "moment";

import { Listener } from "@sapphire/framework";
import { Client } from "discord.js";

// Schemas
import ActiveMutes from "@schemas/Infractions/ActiveMutes";

export default class extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "ready",
        });
    }

    async run(client: Client) {
        Cron("*/5 * * * * *", async () => {
            // Variables
            const currentTimestamp = moment().unix();

            // Current Mutes
            const currentMutes = await ActiveMutes.find();

            // Check if None
            if (currentMutes.length < 1) {
                return;
            }

            // Go Through Mutes
            currentMutes.forEach(async (mute) => {
                // Variables
                const currentGuild = client.guilds.cache.get(mute.guild_id!)!;
                const currentMember = currentGuild.members.cache.get(
                    mute.user_id!
                );

                const serverMuteRole = currentGuild.roles.cache.find(
                    (r) => r.name === "Server Mute"
                );
                const marketplaceMuteRole = currentGuild.roles.cache.find(
                    (r) => r.name === "Marketplace Mute"
                );
                const muteExpires = Number(mute.mute_expires);

                // Check if Mute Hasn't Expired
                if (muteExpires > currentTimestamp) {
                    return;
                }

                // Check if TIMEOUT Mute
                if (mute.mute_type === "Server") {
                    if (currentMember && serverMuteRole) {
                        await currentMember.roles.remove(serverMuteRole);
                    }
                }

                // Check if MARKETPLACE Mute
                if (mute.mute_type === "Marketplace") {
                    if (currentMember && marketplaceMuteRole) {
                        await currentMember.roles.remove(marketplaceMuteRole);
                    }
                }

                // Remove Mute
                await mute.deleteOne();
            });
        });
    }
}

// Dependencies
import { Listener } from "@sapphire/framework";
import { Client, ChannelType } from "discord.js";

export default class extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "ready",
        });
    }

    async run(client: Client) {
        // Go Through Guilds
        client.guilds.cache.forEach((g) => {

            // Go Through Channels
            g.channels.cache.forEach((c) => {

                // Check Channel Type
                if (c.type === ChannelType.GuildText) {
                    // Fetch/Cache Messages
                    c.messages.fetch();
                }
            });
        });
    }
}

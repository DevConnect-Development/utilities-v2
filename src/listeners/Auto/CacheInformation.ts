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
        // Cycle Guilds
        client.guilds.cache.forEach((g) => {
            // Fetch Members & Messages
            g.members.fetch();
            g.channels.fetch();

            // Message Fetch
            g.channels.cache.forEach((c) => {
                if (c.type !== ChannelType.GuildText) return;

                c.messages.fetch();
            });
        });
    }
}

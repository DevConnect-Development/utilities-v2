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

            // Fetch Information
            g.members.fetch();
            g.channels.fetch();
        });
    }
}

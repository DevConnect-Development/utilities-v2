// Dependencies
import channelConfig from "../../util/schemas/config/channel.js";

import { Listener } from "@sapphire/framework";
import { ThreadChannel, EmbedBuilder } from "discord.js";

function sleep(ms: any) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export default class extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "threadCreate",
        });
    }

    async run(thread: ThreadChannel) {
        // Variables
        const helpChannel = await channelConfig.findOne({
            channel_key: "help",
        });

        // Key Exist Check
        if (!helpChannel) {
            return;
        }

        // Embed
        const helpChannelEmbed = new EmbedBuilder()
            .setDescription(
                [
                    `**Welcome to the Help channel**! `,
                    `Before continuing, please;`,
                    ``,
                    `- Explain your problem thoroughly.`,
                    `- Share any possible causes you may know.`,
                    `- Share screenshots of your problem.`,
                ].join("\n")
            )
            .setColor("#ff8000");

        // Send Help Embed
        if (thread.parentId === helpChannel.channel_id) {
            await sleep(1000);

            return await thread.send({
                embeds: [helpChannelEmbed],
            });
        }
    }
}

// Dependencies
import delay from "delay";

import { Listener } from "@sapphire/framework";
import {
    ThreadChannel,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    ActionRowBuilder,
} from "discord.js";

// Schemas
import ChannelConfig from "../../util/schemas/config/channel.js";

export default class extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "threadCreate",
        });
    }

    async run(thread: ThreadChannel) {
        // Variables
        const helpChannel = await ChannelConfig.findOne({
            guild_id: thread.guildId,
            channel_key: "help_forum",
        });

        // Key Exist Check
        if (!helpChannel) {
            return;
        }

        // Components
        const solveIssueButton = new ButtonBuilder()
            .setCustomId(`help.solveissue`)
            .setLabel("Mark as Solved")
            .setEmoji("✅")
            .setStyle(ButtonStyle.Primary);
        const buttonAR = new ActionRowBuilder<ButtonBuilder>().addComponents(
            solveIssueButton
        );

        // Embed
        const helpChannelEmbed = new EmbedBuilder()
            .setDescription(
                [
                    `**Welcome to the Help channel**! `,
                    `Before continuing please;`,
                    ``,
                    `- Explain your problem thoroughly.`,
                    `- Share any possible causes you may know.`,
                    `- Share screenshots of your problem.`,
                ].join("\n")
            )
            .setColor("#ff8000");

        // Send Help Embed
        if (thread.parentId === helpChannel.channel_id) {
            await delay(200);

            return await thread.send({
                embeds: [helpChannelEmbed],
                components: [buttonAR],
            });
        }
    }
}

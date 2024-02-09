// Dependencies
import globalConfig from "../../../../config.js";
import { resetSkillLogEmbed } from "../../../../util/Services/ApplicationService/index.js";

import {
    InteractionHandler,
    InteractionHandlerTypes,
} from "@sapphire/framework";
import { ButtonInteraction, TextChannel } from "discord.js";

// Schemas
import ChannelConfig from "../../../../util/schemas/Config/ChannelConfig.js";
import SkillApplications from "../../../../util/schemas/Apps/SkillApplications.js";

export default class extends InteractionHandler {
    constructor(
        ctx: InteractionHandler.LoaderContext,
        options: InteractionHandler.Options
    ) {
        super(ctx, {
            ...options,
            interactionHandlerType: InteractionHandlerTypes.Button,
        });
    }

    parse(interaction: ButtonInteraction) {
        const [category, action] = interaction.customId.split(".");

        if (category !== "applications" || action !== "skilldecline") {
            return this.none();
        }

        return this.some();
    }

    async run(interaction: ButtonInteraction) {
        // Defer Update
        await interaction.deferUpdate();

        // Variables
        const applicationID = interaction.customId.split(".")[2];

        // Skill Applications Channel
        const skillAppLogs = await ChannelConfig.findOne({
            guild_id: globalConfig.staffGuild,
            channel_key: "skill_logs",
        });
        const skillAppLogsChannel = this.container.client.channels.cache.find(
            (c) => c.id === skillAppLogs?.channel_id
        ) as TextChannel;
        if (!skillAppLogs || !skillAppLogsChannel) {
            return await interaction.editReply({
                content: "Interaction has failed.",
                components: [],
            });
        }

        // Fetch Application
        const fetchedApplication = await SkillApplications.findOne({
            app_id: applicationID,
        });
        if (!fetchedApplication) {
            return await interaction.editReply({
                content: "Failed to fetch application.",
                components: [],
            });
        }

        // Fetch Embed
        const createEmbed = await resetSkillLogEmbed(fetchedApplication.app_id);
        if (!createEmbed) {
            return await interaction.editReply({
                content: "Interaction has failed.",
                components: [],
            });
        }

        // Set Application Status
        await fetchedApplication.updateOne({
            app_status: "Declined",
            app_reviewer: interaction.user.id,
        });

        // Send Log Embed
        await skillAppLogsChannel.send({
            embeds: createEmbed.embeds,
        });

        // Delete Message
        await interaction.deleteReply();
    }
}
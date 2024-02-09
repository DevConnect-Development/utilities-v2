// Dependencies
import globalConfig from "../../../../config.js";
import {
    returnButton,
    resetSkillStaffEmbed,
} from "../../../../util/Services/ApplicationService/index.js";

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

        if (category !== "applications" || action !== "skillsubmit") {
            return this.none();
        }

        return this.some();
    }

    async run(interaction: ButtonInteraction) {
        // Defer Update
        await interaction.deferUpdate();

        // Variables
        const applicationID = interaction.customId.split(".")[2];

        // Components
        const createdReturnButton = await returnButton();

        // Skill Applications Channel
        const skillApps = await ChannelConfig.findOne({
            guild_id: globalConfig.communityGuild,
            channel_key: "skill_applications",
        });
        const skillAppsChannel = this.container.client.channels.cache.find(
            (c) => c.id === skillApps?.channel_id
        ) as TextChannel;
        if (!skillApps || !skillAppsChannel) {
            return await interaction.editReply({
                content: "Interaction has failed.",
                components: [createdReturnButton.components],
                embeds: [],
            });
        }

        // Fetch Application
        const fetchedApplication = await SkillApplications.findOne({
            app_id: applicationID,
        });
        if (!fetchedApplication) {
            return await interaction.editReply({
                content: "Failed to fetch application.",
                components: [createdReturnButton.components],
                embeds: [],
            });
        }

        // Check If Already Pending
        const existingApplication = await SkillApplications.exists({
            app_status: "Pending",
            app_role: fetchedApplication.app_role,
            author_id: interaction.user.id,
        });
        if (existingApplication) {
            return await interaction.editReply({
                content:
                    "You are unable to submit this application as you already have a pending one for the same role.",
                components: [createdReturnButton.components],
                embeds: [],
            });
        }

        // Fetch Embed
        const createEmbed = await resetSkillStaffEmbed(
            fetchedApplication.app_id
        );
        if (!createEmbed) {
            return await interaction.editReply({
                content: "Interaction has failed.",
                components: [createdReturnButton.components],
                embeds: [],
            });
        }

        // Set Application Status
        await fetchedApplication.updateOne({
            app_status: "Pending",
        });

        // Send Staff Embed
        await skillAppsChannel.send({
            embeds: createEmbed.embeds,
            components: createEmbed.components,
        });

        // Update Message
        await interaction.editReply({
            content: "Skill Application successfully submitted.",
            components: [],
            embeds: [],
        });
    }
}
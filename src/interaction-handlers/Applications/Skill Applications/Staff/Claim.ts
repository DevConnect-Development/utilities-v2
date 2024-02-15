// Dependencies
import globalConfig from "@config";
import { resetSkillStaffEmbed } from "@services/ApplicationService";

import {
    InteractionHandler,
    InteractionHandlerTypes,
} from "@sapphire/framework";
import { ButtonInteraction, TextChannel } from "discord.js";

// Schemas
import SkillApplications from "@schemas/Apps/SkillApplications";

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

        if (category !== "applications" || action !== "skillclaim") {
            return this.none();
        }

        return this.some();
    }

    async run(interaction: ButtonInteraction) {
        // Defer Update
        await interaction.deferUpdate();

        // Variables
        const applicationID = interaction.customId.split(".")[2];
        let chosenClaimant = "";

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

        // Update Claimant
        if (!fetchedApplication.app_claimant) {
            chosenClaimant = interaction.user.id;
        }

        await fetchedApplication.updateOne({
            app_claimant: interaction.user.id,
        });

        // Fetch Embed
        const createEmbed = await resetSkillStaffEmbed(
            fetchedApplication.app_id
        );
        if (!createEmbed) {
            return await interaction.editReply({
                content: "Interaction has failed.",
                components: [],
            });
        }

        // Update Embed
        await interaction.editReply({
            components: createEmbed.components,
            embeds: createEmbed.embeds,
        });
    }
}

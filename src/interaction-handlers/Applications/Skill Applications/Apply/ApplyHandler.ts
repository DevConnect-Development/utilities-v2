// Dependencies
import { resetSkillPreview } from "../../../../util/Services/ApplicationService/index.js";

import {
    InteractionHandler,
    InteractionHandlerTypes,
} from "@sapphire/framework";
import { ButtonInteraction } from "discord.js";

// Schemas
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

        if (category !== "applications" || action !== "skillapply") {
            return this.none();
        }

        return this.some();
    }

    async run(interaction: ButtonInteraction) {
        // Defer Update
        await interaction.deferUpdate();

        // Variables
        let currentApplication = await SkillApplications.findOne({
            app_status: "Draft",
            author_id: interaction.user.id,
        });
        if (!currentApplication) {
            currentApplication = await SkillApplications.create({
                app_role: "Scripter",
                app_status: "Draft",
                author_id: interaction.user.id,
            });
        }

        // Fetch Embed
        const createEmbed = await resetSkillPreview(currentApplication.app_id);
        if (!createEmbed) {
            return await interaction.editReply({
                content: "Interaction has failed.",
                components: [],
            });
        }

        // Preview Instructions
        const previewInstructions = [
            "Below is a preview of your Skill Role Application.",
            "You are able to edit it and provide the required information, along with reviewing it before sending it to Application Readers.",
            "",
            "If you ever need assistance, feel free to contact an Application Reader.",
        ].join("\n");

        // Update Application
        await interaction.editReply({
            content: previewInstructions,
            embeds: createEmbed.embeds,
            components: createEmbed.components,
        });
    }
}

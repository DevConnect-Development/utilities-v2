// Dependencies
import {
    returnButton,
    resetSkillPreview,
} from "@services/ApplicationService";

import {
    InteractionHandler,
    InteractionHandlerTypes,
} from "@sapphire/framework";
import { StringSelectMenuInteraction } from "discord.js";

// Schemas
import SkillApplications from "@schemas/Apps/SkillApplications";

export default class extends InteractionHandler {
    constructor(
        ctx: InteractionHandler.LoaderContext,
        options: InteractionHandler.Options
    ) {
        super(ctx, {
            ...options,
            interactionHandlerType: InteractionHandlerTypes.SelectMenu,
        });
    }

    parse(interaction: StringSelectMenuInteraction) {
        const [category, action] = interaction.customId.split(".");

        if (category !== "applications" || action !== "skillselectrole")
            return this.none();

        return this.some();
    }

    async run(interaction: StringSelectMenuInteraction) {
        // Defer Update
        await interaction.deferUpdate();

        // Variables
        const newRole = interaction.values[0];
        const applicationID = interaction.customId.split(".")[2];

        // Components
        const createdReturnButton = await returnButton();

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

        // Update Role
        await fetchedApplication.updateOne({
            app_role: newRole,
        });

        // Fetch Embed
        const createEmbed = await resetSkillPreview(fetchedApplication.app_id);
        if (!createEmbed) {
            return await interaction.editReply({
                content: "Interaction has failed.",
                components: [createdReturnButton.components],
                embeds: [],
            });
        }

        // Update Application
        await interaction.editReply({
            embeds: createEmbed.embeds,
            components: createEmbed.components,
        });
    }
}

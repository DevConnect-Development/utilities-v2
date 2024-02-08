// Dependencies
import { resetSkillPreview } from "../../../../util/Services/ApplicationService/index.js";

import {
    InteractionHandler,
    InteractionHandlerTypes,
} from "@sapphire/framework";
import { ModalSubmitInteraction } from "discord.js";

// Schemas
import SkillApplications from "../../../../util/schemas/Apps/SkillApplications.js";

export default class extends InteractionHandler {
    constructor(
        ctx: InteractionHandler.LoaderContext,
        options: InteractionHandler.Options
    ) {
        super(ctx, {
            ...options,
            interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
        });
    }

    parse(interaction: ModalSubmitInteraction) {
        const [category, action] = interaction.customId.split(".");

        if (category !== "applications" || action !== "skilleditconfirm")
            return this.none();

        return this.some();
    }

    async run(interaction: ModalSubmitInteraction) {
        // Defer Reply
        await interaction.deferUpdate();

        // Variables
        const applicationID = interaction.customId.split(".")[2];
        const applicationAdditionalComment =
            interaction.fields.getTextInputValue("additionalcomment");
        const applicationPastWork =
            interaction.fields.getTextInputValue("workexamples");

        // Fetch Application
        const fetchedApplication = await SkillApplications.findOne({
            app_id: applicationID,
        });
        if (!fetchedApplication) {
            return await interaction.editReply({
                content: "Interaction has failed.",
                components: [],
            });
        }

        // Update Past Work
        const pastWork = applicationPastWork
            .split("\n")
            .filter((line) => line.trim() !== "");
        await fetchedApplication.updateOne({
            provided_comment: applicationAdditionalComment,
            provided_work: pastWork,
        });

        // Fetch Embed
        const createEmbed = await resetSkillPreview(fetchedApplication.app_id);
        if (!createEmbed) {
            return await interaction.editReply({
                content: "Interaction has failed.",
                components: [],
            });
        }

        // Update Application
        await interaction.editReply({
            embeds: createEmbed.embeds,
            components: createEmbed.components,
        });
    }
}
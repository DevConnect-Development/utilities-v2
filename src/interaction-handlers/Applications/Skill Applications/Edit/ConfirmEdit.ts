// Dependencies
import validator from "validator";
import {
    returnButton,
    resetSkillPreview,
} from "@services/ApplicationService";

import {
    InteractionHandler,
    InteractionHandlerTypes,
} from "@sapphire/framework";
import { ModalSubmitInteraction } from "discord.js";

// Schemas
import SkillApplications from "@schemas/Apps/SkillApplications";

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

        // Past Work Validation
        const cleanPastWork = applicationPastWork
        .split("\n")
        .filter((line) => line.trim() !== "");
        const filteredPastWork = []

        for (const example of cleanPastWork) {
            if(validator.isURL(example) && filteredPastWork.length < 4) {
                filteredPastWork.push(example)
            }
        }

        // Update Past Work
        await fetchedApplication.updateOne({
            provided_comment: applicationAdditionalComment,
            provided_work: filteredPastWork,
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

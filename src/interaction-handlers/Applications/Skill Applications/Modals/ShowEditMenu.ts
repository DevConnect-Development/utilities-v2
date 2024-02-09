// Dependencies
import { returnButton } from "../../../../util/Services/ApplicationService/index.js";

import {
    InteractionHandler,
    InteractionHandlerTypes,
} from "@sapphire/framework";
import {
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
} from "discord.js";

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

        if (category !== "applications" || action !== "skilledit")
            return this.none();

        return this.some();
    }

    async run(interaction: ButtonInteraction) {
        // Variables
        const applicationID = interaction.customId.split(".")[2];

        // Components
        const createdReturnButton = await returnButton();

        // Fetch Application
        const fetchedApplication = await SkillApplications.findOne({
            app_id: applicationID,
        });
        if (!fetchedApplication) {
            return await interaction.update({
                content: "Failed to fetch application.",
                components: [createdReturnButton.components],
                embeds: [],
            });
        }

        // Modal
        const editApplicationModal = new ModalBuilder()
            .setCustomId(
                `applications.skilleditconfirm.${fetchedApplication.app_id}`
            )
            .setTitle("Edit Skill Application");
        const additionalCommentField = new TextInputBuilder()
            .setCustomId("additionalcomment")
            .setLabel("Additional Comment")
            .setPlaceholder(
                "An additional comment for the Application Reviewer."
            )
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(200)
            .setRequired(false);
        const workExamplesField = new TextInputBuilder()
            .setCustomId("workexamples")
            .setLabel("Work Examples")
            .setPlaceholder("Separate new work with new lines.")
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(600)
            .setRequired(false);

        // Set Default Value
        if (fetchedApplication.provided_comment) {
            additionalCommentField.setValue(
                fetchedApplication.provided_comment
            );
        }
        if (fetchedApplication.provided_work.length > 0) {
            workExamplesField.setValue(
                fetchedApplication.provided_work.join("\n")
            );
        }

        // Action Rows
        const additionalCommentAR =
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                additionalCommentField
            );
        const editWorkExamplesAR =
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                workExamplesField
            );

        editApplicationModal.addComponents(
            additionalCommentAR,
            editWorkExamplesAR
        );

        // Send Modal
        await interaction.showModal(editApplicationModal);
    }
}

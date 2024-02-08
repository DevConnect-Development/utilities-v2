// Dependencies
import {
    InteractionHandler,
    InteractionHandlerTypes,
} from "@sapphire/framework";
import {
    ButtonInteraction,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} from "discord.js";

// Schemas
import SkillApplications from "../../../util/schemas/Apps/SkillApplications.js";

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

        if (category !== "applications" || action !== "skillapplicationpanel") {
            return this.none();
        }

        return this.some();
    }

    async run(interaction: ButtonInteraction) {
        // Defer Update
        await interaction.deferUpdate();

        // Buttons
        const applyButton = new ButtonBuilder()
            .setCustomId("applications.skillapply")
            .setLabel("Apply for Skill")
            .setStyle(ButtonStyle.Success);
        const viewButton = new ButtonBuilder()
            .setCustomId("applications.skillview")
            .setLabel("View Applications")
            .setStyle(ButtonStyle.Secondary);
        const gobackButton = new ButtonBuilder()
            .setCustomId("applications.resetpanel")
            .setLabel("Go Back")
            .setStyle(ButtonStyle.Danger);
        const buttonAR = new ActionRowBuilder<ButtonBuilder>().addComponents(
            applyButton,
            viewButton
        );
        const gobackAR = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(gobackButton)

        // Existing Application
        const existingApplication = await SkillApplications.findOne({
            app_status: "Draft",
            author_id: interaction.user.id,
        })
        if(existingApplication) {
            applyButton.setLabel("Edit Draft")
        }

        // Update Reply
        await interaction.editReply({
            content: "",
            embeds: [],
            components: [buttonAR, gobackAR],
        });
    }
}

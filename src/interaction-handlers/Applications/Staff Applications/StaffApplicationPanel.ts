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

        if (category !== "applications" || action !== "staffapplicationpanel") {
            return this.none();
        }

        return this.some();
    }

    async run(interaction: ButtonInteraction) {
        // Defer Update
        await interaction.deferUpdate();

        // Buttons
        const applyButton = new ButtonBuilder()
            .setCustomId("applications.staffapply")
            .setLabel("Apply for Position")
            .setStyle(ButtonStyle.Success);
        const staffRoleButton = new ButtonBuilder()
            .setCustomId("applications.staffview")
            .setLabel("View Applications")
            .setStyle(ButtonStyle.Secondary);
        const gobackButton = new ButtonBuilder()
            .setCustomId("applications.resetpanel")
            .setLabel("Go Back")
            .setStyle(ButtonStyle.Danger);
        const buttonAR = new ActionRowBuilder<ButtonBuilder>().addComponents(
            applyButton,
            staffRoleButton
        );
        const gobackAR = new ActionRowBuilder<ButtonBuilder>().addComponents(
            gobackButton
        );

        // Update Reply
        await interaction.editReply({
            content: "",
            embeds: [],
            components: [buttonAR, gobackAR],
        });
    }
}

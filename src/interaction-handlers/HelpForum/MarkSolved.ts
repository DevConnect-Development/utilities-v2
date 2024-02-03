// Dependencies
import {
    InteractionHandler,
    InteractionHandlerTypes,
} from "@sapphire/framework";
import {
    ButtonInteraction,
    ChannelType,
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

        if (category !== "help" || action !== "solveissue") {
            return this.none();
        }

        return this.some();
    }

    async run(interaction: ButtonInteraction) {
        // Channel Checks
        if (!interaction.channel || interaction.channel.type !== ChannelType.PublicThread) return;
        if (interaction.channel.ownerId !== interaction.user.id) return;

        // Defer Reply
        await interaction.deferUpdate();

        // Components
        const resolvedButton = new ButtonBuilder()
            .setCustomId(`help.resolved`)
            .setLabel("Resolved")
            .setEmoji("🔒")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);
        const buttonAR = new ActionRowBuilder<ButtonBuilder>().addComponents(
            resolvedButton
        );

        // Lock Thread
        await interaction.channel.setLocked(true)

        // Edit Button
        await interaction.editReply({
            components: [buttonAR],
        });
    }
}

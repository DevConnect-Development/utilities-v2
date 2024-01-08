// Dependencies
import {
    InteractionHandler,
    InteractionHandlerTypes,
} from "@sapphire/framework";
import { StringSelectMenuInteraction } from "discord.js";

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

        if (category !== "userservice" && action !== "replyuser") {
            return this.none();
        }

        return this.some();
    }

    async run(interaction: StringSelectMenuInteraction) {

        // Variables
        const chosenUser = interaction.values[0]

        // UserID Exist Check
        if(!chosenUser) {
            await interaction.message.edit({
                components: interaction.message.components
            })
            return await interaction.reply({
                ephemeral: true,
                content: "Couldn't find requested User ID."
            })
        }

        // Return with UserID
        await interaction.message.edit({
            components: interaction.message.components
        })
        return await interaction.reply({
            ephemeral: true,
            content: `<@${chosenUser}>`
        })
    }
}

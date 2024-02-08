// Dependencies
import { resetEmbed } from "../../../util/services/TicketService/index.js";

import {
    InteractionHandler,
    InteractionHandlerTypes,
} from "@sapphire/framework";
import { ButtonInteraction } from "discord.js";

// Schemas
import tickets from "../../../util/schemas/tickets.js";

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

        if (category !== "tickets" || action !== "edit") {
            return this.none();
        }

        return this.some();
    }

    async run(interaction: ButtonInteraction) {
        await interaction.deferUpdate()

        // Fetch Ticket
        const currentTicket = await tickets.findOne({
            ticket_status: "Draft",
            author_id: interaction.user.id,
        })
        if(!currentTicket) {
            return await interaction.editReply({
                content: "Interaction has failed.",
                components: []
            })
        }

        // Fetch Embed
        const createEmbed = await resetEmbed(currentTicket.ticket_id)
        if(!createEmbed) {
            return await interaction.editReply({
                content: "Interaction has failed.",
                components: []
            })
        }

        // Update Ticket
        await interaction.editReply({
            embeds: createEmbed.embeds,
            components: createEmbed.components,
        });
    }
}

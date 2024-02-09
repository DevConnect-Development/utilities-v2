// Dependencies
import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";

// Main Fucntion
export default async function getRobloxInfo() {
    // Buttons
    const returnButton = new ButtonBuilder()
        .setCustomId("applications.skillapply")
        .setLabel("Return")
        .setStyle(ButtonStyle.Danger);
    const returnAR = new ActionRowBuilder<ButtonBuilder>().addComponents(
        returnButton
    );

    return {
        components: returnAR,
    };
}

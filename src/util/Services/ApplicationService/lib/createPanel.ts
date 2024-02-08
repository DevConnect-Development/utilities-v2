// Dependencies
import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";

// Main Fucntion
export default async function getRobloxInfo() {
    // Buttons
    const skillRoleButton = new ButtonBuilder()
        .setCustomId("applications.skillapplicationpanel")
        .setLabel("Skill Roles")
        .setStyle(ButtonStyle.Primary);
    const staffRoleButton = new ButtonBuilder()
        .setCustomId("applications.staffapplicationpanel")
        .setLabel("Staff Applications")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);
    const buttonAR = new ActionRowBuilder<ButtonBuilder>().addComponents(
        skillRoleButton,
        staffRoleButton
    );

    return {
        components: buttonAR,
    };
}

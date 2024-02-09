// Dependencies
import {
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ActionRowBuilder,
} from "discord.js";

// Schemas
import SkillApplications from "../../../../../schemas/Apps/SkillApplications.js";

export default async function (applicationID: String) {
    // Fetch Ticket
    const fetchedApplication = await SkillApplications.findOne({
        app_id: applicationID,
    });

    // Exists Check
    if (!fetchedApplication) {
        return undefined;
    }

    // Variables

    // Components

    // Embed
    const mainEmbed = new EmbedBuilder()
        .setTitle(`Skill Application - ${fetchedApplication.app_role}`)
        .addFields(
            {
                name: "Author",
                value: `<@${fetchedApplication.author_id}> (${fetchedApplication.author_id})`,
                inline: true,
            },
            {
                name: "Work Examples",
                value:
                    fetchedApplication.provided_work.length > 0
                        ? fetchedApplication.provided_work.join("\n")
                        : "No Work Provided",
                inline: true,
            }
        )
        .setFooter({
            text: `Application ID: ${fetchedApplication.app_id}`,
        });

    // Optional Fields
    if (fetchedApplication.provided_comment) {
        mainEmbed.addFields({
            name: "Additional Comment",
            value: fetchedApplication.provided_comment,
            inline: false,
        });
    }


    // Return Embed
    return {
        embeds: [mainEmbed],
    };
}

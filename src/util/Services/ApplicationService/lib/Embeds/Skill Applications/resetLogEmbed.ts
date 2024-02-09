// Dependencies
import { container } from "@sapphire/framework";

import { EmbedBuilder } from "discord.js";

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
    const appReviewer = container.client.users.cache.find(
        (u) => u.id === fetchedApplication.app_reviewer
    );

    // Embed
    const mainEmbed = new EmbedBuilder()
        .setTitle(`Skill Application - ${fetchedApplication.app_role} (**${fetchedApplication.app_status?.toUpperCase()}**)`)
        .setColor(
            fetchedApplication.app_status === "Approved" ? "Green" : "Red"
        )
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
            text:
                `ID: ${fetchedApplication.app_id}` +
                (appReviewer ? ` • Reviewed by @${appReviewer.username}` : ""),
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

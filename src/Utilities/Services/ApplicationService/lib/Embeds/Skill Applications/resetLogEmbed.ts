// Dependencies
import globalConfig from "@config";
import GetBaseURL from "@modules/Functions/GetBaseURL";

import { container } from "@sapphire/framework";
import { EmbedBuilder } from "discord.js";

// Schemas
import SkillApplications from "@schemas/Apps/SkillApplications";

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
    const selectedReasons =
        fetchedApplication.app_declinereasons as unknown as Array<String>;
    const filteredPastWork = [];
    const appReviewer = container.client.users.cache.find(
        (u) => u.id === fetchedApplication.app_reviewer
    );

    // Sort Past Work
    for (const example of fetchedApplication.provided_work) {
        const baseURL = GetBaseURL(example);
        if (baseURL) {
            const isVerified = globalConfig.verifiedURLS.includes(baseURL);

            filteredPastWork.push(
                `[${baseURL}](${example}) ${!isVerified ? "**[❗]**" : ""}`
            );
        }
    }

    // Embed
    const mainEmbed = new EmbedBuilder()
        .setTitle(
            `(**${fetchedApplication.app_status?.toUpperCase()}**) - ${
                fetchedApplication.app_role
            } Application `
        )
        .setFooter({
            text:
                `ID: ${fetchedApplication.app_id}` +
                (appReviewer ? ` • Reviewed by @${appReviewer.username}` : ""),
        });

    // Conditional Components
    if (fetchedApplication.app_claimant) {
        mainEmbed.addFields({
            name: "Status",
            value: `Last claimed by: <@${fetchedApplication.app_claimant}>`,
        });
    }

    // Add Fields
    mainEmbed.addFields(
        {
            name: "Author",
            value: `<@${fetchedApplication.author_id}> (${fetchedApplication.author_id})`,
        },
        {
            name: "Work Examples",
            value:
                filteredPastWork.length > 0
                    ? filteredPastWork.join("\n")
                    : "No Work Provided",
        }
    );

    // Optional Fields
    if (fetchedApplication.provided_comment) {
        mainEmbed.addFields({
            name: "Additional Comment",
            value: fetchedApplication.provided_comment,
        });
    }
    if (selectedReasons.length > 0) {
        mainEmbed.addFields({
            name: "Decline Reasons",
            value: `\`\`\`${selectedReasons.join("\n")}\`\`\``,
        });
    }

    // Set Color
    const appStatus = fetchedApplication.app_status;
    if (appStatus === "Approved") {
        mainEmbed.setColor("Green");
    } else if (appStatus === "Declined") {
        mainEmbed.setColor("Red");
    }

    // Return Embed
    return {
        embeds: [mainEmbed],
    };
}

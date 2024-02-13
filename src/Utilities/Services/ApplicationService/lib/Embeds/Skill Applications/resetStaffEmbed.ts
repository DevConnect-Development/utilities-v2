// Dependencies
import globalConfig from "@config";
import GetBaseURL from "@modules/Functions/GetBaseURL";

import {
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} from "discord.js";

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
    const filteredPastWork = [];

    // Components
    const approveButton = new ButtonBuilder()
        .setCustomId(`applications.skillapprove.${fetchedApplication.app_id}`)
        .setLabel("Approve")
        .setStyle(ButtonStyle.Success);
    const declineButton = new ButtonBuilder()
        .setCustomId(`applications.skilldecline.${fetchedApplication.app_id}`)
        .setLabel("Decline")
        .setStyle(ButtonStyle.Danger);
    const buttonsAR = new ActionRowBuilder<ButtonBuilder>().addComponents(
        approveButton,
        declineButton
    );

    // Sort Past Work
    for (const example of fetchedApplication.provided_work) {
        const baseURL = GetBaseURL(example);
        if (baseURL) {
            const isVerified = globalConfig.verifiedURLS.includes(baseURL);

            filteredPastWork.push(
                `[${baseURL}](${example}) ${
                    !isVerified ? "(**URL NOT VERIFIED**)" : ""
                }`
            );
        }
    }

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
                filteredPastWork.length > 0
                        ? filteredPastWork.join("\n")
                        : "No Work Provided",
                inline: true,
            }
        )
        .setFooter({
            text: `ID: ${fetchedApplication.app_id}`,
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
        components: [buttonsAR],
    };
}

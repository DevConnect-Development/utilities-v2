// Dependencies
import globalConfig from "@config";
import GetBaseURL from "@modules/Functions/GetBaseURL";

import {
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
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
    const claimButton = new ButtonBuilder()
        .setCustomId(`applications.skillclaim.${fetchedApplication.app_id}`)
        .setLabel("Claim")
        .setStyle(ButtonStyle.Primary);

    const declineReasonSelect = new StringSelectMenuBuilder()
        .setCustomId(
            `applications.skillselectdeclinereason.${fetchedApplication.app_id}`
        )
        .setPlaceholder("Select decline reasons to show the user.")
        .setOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel("Not Sufficient")
                .setDescription(
                    "The past work is not sufficient enough for this skill role."
                )
                .setValue("Not_Sufficient"),

            new StringSelectMenuOptionBuilder()
                .setLabel("Troll Application")
                .setDescription(
                    "This application is a troll application, and will not be reviewed."
                )
                .setValue("Troll_Application")
        )
        .setMinValues(1)
        .setMaxValues(2);

    const declineReasonAR =
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            declineReasonSelect
        );
    const buttonsAR = new ActionRowBuilder<ButtonBuilder>().addComponents(
        approveButton,
        declineButton,
        claimButton
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

    // Conditional Components
    if (fetchedApplication.app_claimant) {
        claimButton.setLabel("Unclaim");
    }
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
        components: [buttonsAR, declineReasonAR],
    };
}

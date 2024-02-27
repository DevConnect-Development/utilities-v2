// Dependencies
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
    const outstandingIssues: Array<String> = [];
    const filteredPastWork = [];
    const selectedRole = fetchedApplication.app_role;

    // Components
    const editButton = new ButtonBuilder()
        .setCustomId(`applications.skilledit.${fetchedApplication.app_id}`)
        .setLabel("Edit Application");
    const submitButton = new ButtonBuilder()
        .setCustomId(`applications.skillsubmit.${fetchedApplication.app_id}`)
        .setLabel("Submit")
        .setStyle(ButtonStyle.Primary);

    const selectCategory = new StringSelectMenuBuilder()
        .setCustomId(
            `applications.skillselectrole.${fetchedApplication.app_id}`
        )
        .setOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel("Scripter")
                .setValue("Scripter")
                .setDefault(selectedRole === "Scripter" ? true : false),
            new StringSelectMenuOptionBuilder()
                .setLabel("Builder")
                .setValue("Builder")
                .setDefault(selectedRole === "Builder" ? true : false),
            new StringSelectMenuOptionBuilder()
                .setLabel("Modeler")
                .setValue("Modeler")
                .setDefault(selectedRole === "Modeler" ? true : false),
            new StringSelectMenuOptionBuilder()
                .setLabel("Graphics Artist")
                .setValue("Graphics Artist")
                .setDefault(selectedRole === "Graphics Artist" ? true : false),
            new StringSelectMenuOptionBuilder()
                .setLabel("Animator")
                .setValue("Animator")
                .setDefault(selectedRole === "Animator" ? true : false),
            new StringSelectMenuOptionBuilder()
                .setLabel("VFX Artist")
                .setValue("VFX Artist")
                .setDefault(selectedRole === "VFX Artist" ? true : false)
        );

    const selectCategoryAR =
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            selectCategory
        );

    const editAR = new ActionRowBuilder<ButtonBuilder>().addComponents(
        editButton,
        submitButton
    );

    // Sort Past Work
    for (const example of fetchedApplication.provided_work) {
        const baseURL = GetBaseURL(example);
        if (baseURL) {
            filteredPastWork.push(`[${baseURL}](${example})`);
        }
    }

    // Embed
    const mainEmbed = new EmbedBuilder()
        .setTitle(`Skill Application - ${fetchedApplication.app_role}`)
        .addFields(
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
        )
        .setFooter({
            text: `ID: <DRAFT>`,
        });

    // Optional Fields
    if (fetchedApplication.provided_comment) {
        mainEmbed.addFields({
            name: "Additional Comment",
            value: fetchedApplication.provided_comment,
        });
    }

    // Additional Checks
    if (fetchedApplication.provided_work.length < 1) {
        outstandingIssues.push("Missing Provided Work.");
    }

    // Button Checks
    if (outstandingIssues.length > 0) {
        editButton.setStyle(ButtonStyle.Danger);
        editButton.setLabel(
            `Edit Application (${outstandingIssues.length} Missing)`
        );
        submitButton.setDisabled(true);
    } else {
        editButton.setStyle(ButtonStyle.Success);
        submitButton.setDisabled(false);
    }

    // Return Embed
    return {
        embeds: [mainEmbed],
        components: [selectCategoryAR, editAR],
    };
}

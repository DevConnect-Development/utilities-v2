// Dependencies
import globalConfig from "@config";
import declineReasonsConfig from "@configs/ApplicationDecline"
import { resetSkillLogEmbed } from "@services/ApplicationService";

import {
    InteractionHandler,
    InteractionHandlerTypes,
} from "@sapphire/framework";
import { ButtonInteraction, TextChannel } from "discord.js";

// Schemas
import ChannelConfig from "@schemas/Config/ChannelConfig";
import SkillApplications from "@schemas/Apps/SkillApplications";

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

        if (category !== "applications" || action !== "skilldecline") {
            return this.none();
        }

        return this.some();
    }

    async run(interaction: ButtonInteraction) {
        // Defer Update
        await interaction.deferUpdate();

        // Variables
        const applicationID = interaction.customId.split(".")[2];

        // Skill Applications Channel
        const skillAppLogs = await ChannelConfig.findOne({
            guild_id: globalConfig.staffGuild,
            channel_key: "skill_logs",
        });
        const skillAppLogsChannel = this.container.client.channels.cache.find(
            (c) => c.id === skillAppLogs?.channel_id
        ) as TextChannel;
        if (!skillAppLogs || !skillAppLogsChannel) {
            return await interaction.editReply({
                content: "Interaction has failed.",
                components: [],
            });
        }

        // Fetch Application
        const fetchedApplication = await SkillApplications.findOne({
            app_id: applicationID,
        });
        if (!fetchedApplication) {
            return await interaction.editReply({
                content: "Failed to fetch application.",
                components: [],
            });
        }

        // Send Message
        const declineReasons =
            fetchedApplication.app_declinereasons as unknown as Array<String>;
        let filteredDeclineReasons = declineReasons.map((r) => {
            const filteredString = r as "Not_Sufficient" | "Troll_Application";
            return `- ${declineReasonsConfig.skillApplicationDeclineReasons[filteredString]}`;
        });
        const selectedMember = interaction.guild?.members.cache.find(
            (u) => u.id === fetchedApplication.author_id
        );
        if (!selectedMember) {
            return await interaction.editReply({
                content: "Could not find specified **Member**.",
                components: [],
            });
        }

        console.log(declineReasons)

        await selectedMember
            .send(
                [
                    `Your **Skill Role Application** for \`${fetchedApplication.app_role}\` has been declined.`,
                    `${
                        declineReasons.length < 1
                            ? "You may contact an Application Reader for more information."
                            : ""
                    }`,
                    declineReasons.length > 0
                        ? filteredDeclineReasons.join("\n")
                        : "",
                ]
                    .filter(Boolean)
                    .join("\n")
            )
            .catch((e) => {
                console.log(
                    `Failed to send Skill Role Application message to @${selectedMember.user.username} (${selectedMember.id})`
                );
            });

        // Set Application Status
        await fetchedApplication.updateOne({
            app_status: "Declined",
            app_reviewer: interaction.user.id,
        });

        // Fetch Embed
        const createEmbed = await resetSkillLogEmbed(fetchedApplication.app_id);
        if (!createEmbed) {
            return await interaction.editReply({
                content: "Interaction has failed.",
                components: [],
            });
        }

        // Send Log Embed
        await skillAppLogsChannel.send({
            embeds: createEmbed.embeds,
        });

        // Delete Message
        await interaction.deleteReply();
    }
}

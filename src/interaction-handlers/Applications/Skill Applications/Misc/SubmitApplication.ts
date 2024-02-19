// Dependencies
import globalConfig from "@config";
import {
    returnButton,
    resetSkillStaffEmbed,
} from "@services/ApplicationService";

import {
    InteractionHandler,
    InteractionHandlerTypes,
} from "@sapphire/framework";
import { ButtonInteraction, GuildMember, TextChannel } from "discord.js";

// Schemas
import ChannelConfig from "@schemas/Config/ChannelConfig";
import SkillApplications from "@schemas/Apps/SkillApplications";
import SkillRoles from "@schemas/Apps/SkillRoles";
import ActiveMutes from "@schemas/Infractions/ActiveMutes";

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

        if (category !== "applications" || action !== "skillsubmit") {
            return this.none();
        }

        return this.some();
    }

    async run(interaction: ButtonInteraction) {
        // Defer Update
        await interaction.deferUpdate();

        // Variables
        const currentMember = interaction.member! as GuildMember;
        const applicationID = interaction.customId.split(".")[2];

        // Components
        const createdReturnButton = await returnButton();

        // Skill Applications Channel
        const skillApps = await ChannelConfig.findOne({
            guild_id: globalConfig.communityGuild,
            channel_key: "skill_applications",
        });
        const skillAppsChannel = this.container.client.channels.cache.find(
            (c) => c.id === skillApps?.channel_id
        ) as TextChannel;
        if (!skillApps || !skillAppsChannel) {
            return await interaction.editReply({
                content: "Interaction has failed.",
                components: [createdReturnButton.components],
                embeds: [],
            });
        }

        // Check if Application Ban
        const currentApplicationBan = await ActiveMutes.exists({
            guild_id: interaction.guildId,
            user_id: interaction.user.id,
            mute_type: "Applications",
        });
        if (currentApplicationBan) {
            return await interaction.editReply({
                content:
                    "You have an active application mute, and are disallowed from submitting new applications.",
                components: [createdReturnButton.components],
                embeds: [],
            });
        }

        // Fetch Application
        const fetchedApplication = await SkillApplications.findOne({
            app_id: applicationID,
        });
        if (!fetchedApplication) {
            return await interaction.editReply({
                content: "Failed to fetch application.",
                components: [createdReturnButton.components],
                embeds: [],
            });
        }

        // Check If Already Pending
        const existingApplication = await SkillApplications.exists({
            app_status: "Pending",
            app_role: fetchedApplication.app_role,
            author_id: interaction.user.id,
        });
        if (existingApplication) {
            return await interaction.editReply({
                content:
                    "You are unable to submit this application as you already have a pending one for the same role.",
                components: [createdReturnButton.components],
                embeds: [],
            });
        }

        // Check if Already Have Role
        const dbUserHasRole = await SkillRoles.exists({
            user_id: currentMember.id,
            skill_role: fetchedApplication.app_role,
        });
        const userHasRole = currentMember.roles.cache.find(
            (r) => r.name === fetchedApplication.app_role
        );
        if (userHasRole || dbUserHasRole) {
            return await interaction.editReply({
                content: "You already have acquired this role.",
                components: [createdReturnButton.components],
                embeds: [],
            });
        }

        // Fetch Embed
        const createEmbed = await resetSkillStaffEmbed(
            fetchedApplication.app_id
        );
        if (!createEmbed) {
            return await interaction.editReply({
                content: "Interaction has failed.",
                components: [createdReturnButton.components],
                embeds: [],
            });
        }

        // Set Application Status
        await fetchedApplication.updateOne({
            app_status: "Pending",
        });

        // Send Staff Embed
        await skillAppsChannel.send({
            embeds: createEmbed.embeds,
            components: createEmbed.components,
        });

        // Update Message
        await interaction.editReply({
            content: "Skill Application successfully submitted.",
            components: [],
            embeds: [],
        });
    }
}

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

        if (category !== "applications" || action !== "skillview") {
            return this.none();
        }

        return this.some();
    }

    async run(interaction: ButtonInteraction) {
        // Defer Update
        await interaction.deferUpdate();

        // Components
        const createdReturnButton = await returnButton();

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

        // Fetch Applications
        const fetchedApplication = await SkillApplications.find({
            author_id: interaction.user.id,
            app_status: { $ne: "Draft" },
        });
        if (fetchedApplication.length < 1) {
            return await interaction.editReply({
                content: "You have to applications..",
                components: [createdReturnButton.components],
                embeds: [],
            });
        }

        return;
    }
}

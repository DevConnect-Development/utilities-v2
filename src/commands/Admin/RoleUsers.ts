// Dependencies
import globalConfig from "../../config.js";

import moment from "moment";
import { Subcommand } from "@sapphire/plugin-subcommands";

import { PermissionFlagsBits, Guild, Role, EmbedBuilder } from "discord.js";

// Command
export default class extends Subcommand {
    constructor(
        context: Subcommand.LoaderContext,
        options: Subcommand.Options
    ) {
        super(context, {
            ...options,
            name: "role",
            subcommands: [
                {
                    name: "all",
                    chatInputRun: "roleAll",
                },
                {
                    name: "remove",
                    chatInputRun: "removeAll",
                },
            ],
        });
    }

    registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand(
            (builder) => {
                builder
                    .setName("role")
                    .setDescription("Set a user's role.")
                    .setDefaultMemberPermissions(
                        PermissionFlagsBits.Administrator
                    )
                    .addSubcommand((command) =>
                        command
                            .setName("all")
                            .setDescription(
                                "Add a role to all users in the guild."
                            )
                            .addRoleOption((option) =>
                                option
                                    .setName("role")
                                    .setDescription(
                                        "The role to give all users."
                                    )
                                    .setRequired(true)
                            )
                    )
                    .addSubcommand((command) =>
                        command
                            .setName("remove")
                            .setDescription(
                                "Remove a role from all users in the guild."
                            )
                            .addRoleOption((option) =>
                                option
                                    .setName("role")
                                    .setDescription(
                                        "The role to remove from all users."
                                    )
                                    .setRequired(true)
                            )
                    );
            },
            {
                guildIds: globalConfig.allowedGuilds,
            }
        );
    }

    public async roleAll(interaction: Subcommand.ChatInputCommandInteraction) {
        await interaction.deferReply({
            ephemeral: true,
        });

        // Variables
        const currentTimestamp = moment().unix();

        const currentGuild = interaction.guild! as Guild;
        const selectedRole = interaction.options.getRole("role") as Role;

        const formattedMembers = currentGuild.members.cache.map((m) => m);

        const userLength = [];

        // Estimated Time
        const estimatedTimeDur = moment.duration(
            formattedMembers.length,
            "seconds"
        );
        const estimatedTime = `${estimatedTimeDur.hours()}h ${estimatedTimeDur.minutes()}m ${estimatedTimeDur.seconds()}s`;
        const estimatedTimestamp = `<t:${Math.round(
            currentTimestamp + formattedMembers.length
        )}:R>`;

        // Create Response Embed
        const responseEmbed = new EmbedBuilder().addFields({
            name: "Beginning to give everyone the role.",
            value: [
                `It is estimated to take \`${estimatedTime}\` (${estimatedTimestamp})`,
            ].join("\n"),
        });

        // Send Response Embed
        await interaction.editReply({
            embeds: [responseEmbed],
        });

        // Role Users
        for (const member of formattedMembers) {
            if (!member.roles.cache.find((r) => r.id === selectedRole.id)) {
                await member.roles.add(selectedRole).catch((e) => {
                    console.log("Failed to add role.");
                });
                userLength.push(member.id);
            }
        }

        // Completed Reply
        responseEmbed
            .setDescription(
                `Successfully gave the ${selectedRole} role to ${userLength.length} members.`
            )
            .setFields()
            .setFooter({ text: "Completed" })
            .setTimestamp();
        return await interaction
            .editReply({
                embeds: [responseEmbed],
            })
            .catch((e) => {
                return;
            });
    }

    public async removeAll(
        interaction: Subcommand.ChatInputCommandInteraction
    ) {
        await interaction.deferReply({
            ephemeral: true,
        });

        // Variables
        const currentTimestamp = moment().unix();

        const currentGuild = interaction.guild! as Guild;
        const selectedRole = interaction.options.getRole("role") as Role;

        const formattedMembers = currentGuild.members.cache.map((m) => m);

        const userLength = [];

        // Estimated Time
        const estimatedTimeDur = moment.duration(
            formattedMembers.length,
            "seconds"
        );
        const estimatedTime = `${estimatedTimeDur.hours()}h ${estimatedTimeDur.minutes()}m ${estimatedTimeDur.seconds()}s`;
        const estimatedTimestamp = `<t:${Math.round(
            currentTimestamp + formattedMembers.length
        )}:R>`;

        // Create Response Embed
        const responseEmbed = new EmbedBuilder().addFields({
            name: "Attempting to remove the role from everyone.",
            value: [
                `It is estimated to take \`${estimatedTime}\` (${estimatedTimestamp})`,
            ].join("\n"),
        });

        // Send Response Embed
        await interaction.editReply({
            embeds: [responseEmbed],
        });

        // Role Users
        for (const member of formattedMembers) {
            if (member.roles.cache.find((r) => r.id === selectedRole.id)) {
                await member.roles.remove(selectedRole).catch((e) => {
                    console.log("Failed to remove role.");
                });
                userLength.push(member.id);
            }
        }

        // Completed Reply
        responseEmbed
            .setDescription(
                `Successfully removed the ${selectedRole} role from ${userLength.length} members.`
            )
            .setFields()
            .setFooter({ text: "Completed" })
            .setTimestamp();
        return await interaction
            .editReply({
                embeds: [responseEmbed],
            })
            .catch((e) => {
                return;
            });
    }
}

// Dependencies
import moment from "moment";

import { Command } from "@sapphire/framework";
import {
    PermissionFlagsBits,
    Guild,
    GuildMember,
    Role,
    EmbedBuilder,
    Embed,
} from "discord.js";

// Command
export default class extends Command {
    constructor(context: Command.LoaderContext, options: Command.Options) {
        super(context, {
            ...options,
            preconditions: ["checkRanInGuild"],
        });
    }

    registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName("role")
                .setDescription("Set a user's role.")
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
                .addSubcommand((command) =>
                    command
                        .setName("all")
                        .setDescription("Add a role to all users in the guild.")
                        .addRoleOption((option) =>
                            option
                                .setName("role")
                                .setDescription("The role to give all users.")
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
                )
        );
    }

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        // Variables
        const currentTimestamp = moment().unix();
        const currentGuild = interaction.guild! as Guild;
        const currentSubCommand = interaction.options.getSubcommand();

        const selectedRole = interaction.options.getRole("role") as Role;

        const formattedMembers = currentGuild.members.cache.map((m) => {
            return m;
        });

        // Options Check
        if (!currentSubCommand || !selectedRole) {
            return await interaction.reply({
                ephemeral: true,
                content: "Interaction has failed.",
            });
        }

        // Embeds
        const responseEmbed = new EmbedBuilder()
            .setTitle("Utilities Role Command")
            .setColor("#44f9fa");

        // Commands Switch
        switch (currentSubCommand) {
            case "all": {
                // Variables
                const userLength = [];

                const estimatedTimeDur = moment.duration(
                    formattedMembers.length / 2,
                    "seconds"
                );
                const estimatedTime = `${estimatedTimeDur.hours()}h ${estimatedTimeDur.minutes()}m ${estimatedTimeDur.seconds()}s`;
                const estimatedTimestamp = `<t:${
                    currentTimestamp + (formattedMembers.length - 1)
                }:R>`;

                // Start Reply
                responseEmbed
                    .setDescription(
                        [
                            `Beginning to give everyone the ${selectedRole} role.`,
                            `It is estimated to take \`${estimatedTime}\` (${estimatedTimestamp})`,
                        ].join("\n")
                    )
                    .setFooter({ text: "In Progress" })
                    .setTimestamp();
                await interaction.reply({
                    embeds: [responseEmbed],
                });

                // Role all Users
                for (const m of formattedMembers) {
                    if (!m.roles.cache.find((r) => r.id === selectedRole.id)) {
                        await m.roles.add(selectedRole).catch((e) => {
                            console.log("Failed to add role.");
                        });
                        userLength.push(m.id);
                    }
                }

                // Completed Reply
                responseEmbed
                    .setDescription(
                        `Successfully gave the ${selectedRole} role to ${userLength.length} members.`
                    )
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
            case "remove": {
                // Variables
                const userLength = [];

                const estimatedTimeDur = moment.duration(
                    formattedMembers.length / 2,
                    "seconds"
                );
                const estimatedTime = `${estimatedTimeDur.hours()}h ${estimatedTimeDur.minutes()}m ${estimatedTimeDur.seconds()}s`;
                const estimatedTimestamp = `<t:${
                    currentTimestamp + (formattedMembers.length - 1)
                }:R>`;

                // Start Reply
                responseEmbed
                    .setDescription(
                        [
                            `Beginning to remove the ${selectedRole} role from ${formattedMembers.length} members.`,
                            `It is estimated to take \`${estimatedTime}\` (${estimatedTimestamp})`,
                        ].join("\n")
                    )
                    .setFooter({ text: "In Progress" })
                    .setTimestamp();
                await interaction.reply({
                    embeds: [responseEmbed],
                });

                // Remove Roles
                for (const m of formattedMembers) {
                    if (m.roles.cache.find((r) => r.id === selectedRole.id)) {
                        await m.roles.remove(selectedRole).catch((e) => {
                            console.log("Failed to remove role.");
                        });
                        userLength.push(m.id);
                    }
                }

                // Completed Reply
                responseEmbed
                    .setDescription(
                        `Successfully removed the ${selectedRole} role from ${userLength.length} members.`
                    )
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
            default: {
                return await interaction.reply({
                    ephemeral: true,
                    content: "Interaction has failed.",
                });
            }
        }
    }
}

// Dependencies
import globalConfig from "@config";

import { Command } from "@sapphire/framework";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { PermissionFlagsBits, EmbedBuilder } from "discord.js";

// Schemas
import PayrollAmount from "@schemas/Staff/PayrollAmount";

// Formatter
const usdFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

// Command
export default class extends Subcommand {
    constructor(
        context: Subcommand.LoaderContext,
        options: Subcommand.Options
    ) {
        super(context, {
            ...options,
            subcommands: [
                {
                    name: "balance",
                    chatInputRun: "setBalance",
                },
                {
                    name: "role",
                    chatInputRun: "setRole",
                },
            ],
        });
    }

    registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand(
            (builder) => {
                builder
                    .setName("setpayroll")
                    .setDescription("Payroll-related commands.")
                    .addSubcommand((command) =>
                        command
                            .setName("balance")
                            .setDescription("Set a user's Payroll balance.")
                            .addUserOption((option) =>
                                option
                                    .setName("user")
                                    .setDescription(
                                        "The Staff Member you'd like to set the payroll amount of."
                                    )
                                    .setRequired(true)
                            )
                            .addNumberOption((option) =>
                                option
                                    .setName("balance")
                                    .setDescription(
                                        "The balance to change it to."
                                    )
                                    .setRequired(true)
                            )
                    )
                    .addSubcommand((command) =>
                        command
                            .setName("role")
                            .setDescription("Set a user's role.")
                            .addUserOption((option) =>
                                option
                                    .setName("user")
                                    .setDescription(
                                        "The Staff Member you'd like to set the role of."
                                    )
                                    .setRequired(true)
                            )
                            .addStringOption((option) =>
                                option
                                    .setName("role")
                                    .setDescription("The role to change it to.")
                                    .setRequired(true)
                            )
                    )
                    .setDefaultMemberPermissions(
                        PermissionFlagsBits.Administrator
                    );
            },
            {
                guildIds: [globalConfig.staffGuild],
            }
        );
    }

    public async setBalance(interaction: Command.ChatInputCommandInteraction) {
        // Defer Reply
        await interaction.deferReply({
            ephemeral: true,
        });

        // Variables
        const selectedUser = interaction.options.getUser("user");
        const selectedBalance = interaction.options.getNumber("balance");

        // Parameter Check
        if (!selectedUser || !selectedBalance) {
            return interaction.editReply("Interaction has failed.");
        }

        // Payroll Information
        let currentPayroll = await PayrollAmount.findOne({
            user_id: selectedUser.id,
        });
        if (!currentPayroll) {
            currentPayroll = await PayrollAmount.create({
                user_id: selectedUser.id,
                current_role: "",

                usd_amount: "0",
            });
        }

        // Update Payroll
        await currentPayroll.updateOne({
            usd_amount: `${selectedBalance}`,
        });

        // Payroll Embed
        const formattedOldBalance = usdFormatter.format(
            currentPayroll.usd_amount as unknown as number
        );
        const formattedNewBalance = usdFormatter.format(selectedBalance);
        const payrollEmbed = new EmbedBuilder()
            .setAuthor({
                iconURL: selectedUser.displayAvatarURL(),
                name: `${selectedUser.username} ${
                    currentPayroll.current_role
                        ? `(${currentPayroll.current_role})`
                        : ""
                }`,
            })
            .setColor("Orange")
            .setDescription("> Balance Update")
            .addFields(
                {
                    name: "Previous Balance",
                    value: `${formattedOldBalance}`,
                    inline: true,
                },
                {
                    name: "New Balance",
                    value: `${formattedNewBalance}`,
                    inline: true,
                }
            )
            .setTimestamp();

        // Return Response
        return await interaction.editReply({
            embeds: [payrollEmbed],
        });
    }

    public async setRole(interaction: Command.ChatInputCommandInteraction) {
        // Defer Reply
        await interaction.deferReply({
            ephemeral: true,
        });

        // Variables
        const selectedUser = interaction.options.getUser("user");
        const selectedRole = interaction.options.getString("role");

        // Parameter Check
        if (!selectedUser || !selectedRole) {
            return interaction.editReply("Interaction has failed.");
        }

        // Payroll Information
        let currentPayroll = await PayrollAmount.findOne({
            user_id: selectedUser.id,
        });
        if (!currentPayroll) {
            currentPayroll = await PayrollAmount.create({
                user_id: selectedUser.id,
                current_role: "",

                usd_amount: "0",
            });
        }

        // Update Payroll
        await currentPayroll.updateOne({
            current_role: `${selectedRole}`,
        });

        // Payroll Embed
        const payrollEmbed = new EmbedBuilder()
            .setAuthor({
                iconURL: selectedUser.displayAvatarURL(),
                name: `${selectedUser.username} ${
                    selectedRole ? `(${selectedRole})` : ""
                }`,
            })
            .setColor("Orange")
            .setDescription("> Role Update")
            .addFields(
                {
                    name: "Previous Role",
                    value: `${currentPayroll.current_role}`,
                    inline: true,
                },
                {
                    name: "New Role",
                    value: `${selectedRole}`,
                    inline: true,
                }
            )
            .setTimestamp();

        // Return Response
        return await interaction.editReply({
            embeds: [payrollEmbed],
        });
    }
}

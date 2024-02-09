// Dependencies
import globalConfig from "../../../config.js";

import { Command } from "@sapphire/framework";
import { PermissionFlagsBits, EmbedBuilder } from "discord.js";

// Schemas
import PayrollAmount from "../../../util/schemas/Staff/PayrollAmount.js";

// Formatter
const usdFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

// Command
export default class extends Command {
    constructor(context: Command.LoaderContext, options: Command.Options) {
        super(context, {
            ...options,
        });
    }

    registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand(
            (builder) => {
                builder
                    .setName("payroll")
                    .setDescription("Check your payroll balance.");
            },
            {
                guildIds: [globalConfig.staffGuild],
            }
        );
    }

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        // Defer Reply
        await interaction.deferReply({
            ephemeral: true,
        });

        // Variables
        let currentPayroll = await PayrollAmount.findOne({
            user_id: interaction.user.id,
        });

        // Payroll Validity Check
        if (!currentPayroll) {
            currentPayroll = await PayrollAmount.create({
                user_id: interaction.user.id,
                current_role: "",

                usd_amount: "0",
            });
        }

        // Payroll Number Check
        const payrollAsNumber = currentPayroll.usd_amount as unknown as number;
        if (isNaN(payrollAsNumber)) {
            return interaction.editReply("Interaction has failed.");
        }
        const formattedUsdAmount = usdFormatter.format(payrollAsNumber);

        // Payroll Embed
        const payrollEmbed = new EmbedBuilder()
            .setAuthor({
                iconURL: interaction.user.displayAvatarURL(),
                name: `${interaction.user.username} ${
                    currentPayroll.current_role
                        ? `(${currentPayroll.current_role})`
                        : ""
                }`,
            })
            .setColor("#44f9fa")
            .setDescription(`> \`${formattedUsdAmount}\``)
            .setTimestamp();

        // Return Response
        return await interaction.editReply({
            embeds: [payrollEmbed],
        });
    }

    public async setBalance(interaction: Command.ChatInputCommandInteraction) {
        // Permissions Check
        if (
            !interaction.memberPermissions?.has(
                PermissionFlagsBits.Administrator
            )
        ) {
            return;
        }

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
        // Permissions Check
        if (
            !interaction.memberPermissions?.has(
                PermissionFlagsBits.Administrator
            )
        ) {
            return;
        }

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

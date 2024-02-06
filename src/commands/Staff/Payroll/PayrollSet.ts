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
                    .setDescription("Payroll-related commands.")
                    .addSubcommand((command) =>
                        command
                            .setName("setbal")
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
                    .setDefaultMemberPermissions(
                        PermissionFlagsBits.Administrator
                    );
            },
            {
                guildIds: [globalConfig.staffGuild],
            }
        );
    }

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        // Subcommand Check
        const currentSubCommand = interaction.options.getSubcommand();
        if (currentSubCommand !== "set") return;

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
                user_id: interaction.user.id,
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
                iconURL: interaction.user.displayAvatarURL(),
                name: `${interaction.user.username} ${
                    currentPayroll.current_role
                        ? `(${currentPayroll.current_role})`
                        : ""
                }`,
            })
            .setColor("Orange")
            .setDescription("Balance Update")
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
        return interaction.editReply({
            embeds: [payrollEmbed],
        });
    }
}

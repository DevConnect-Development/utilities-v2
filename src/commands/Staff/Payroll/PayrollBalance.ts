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
                            .setName("balance")
                            .setDescription(
                                "Check your Payroll as a DC Staff Member."
                            )
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
        if (currentSubCommand !== "balance") return;

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
            .setDescription(["**Balance**", `${formattedUsdAmount}`].join("\n"))
            .setTimestamp();

        // Return Response
        return interaction.editReply({
            embeds: [payrollEmbed],
        });
    }
}

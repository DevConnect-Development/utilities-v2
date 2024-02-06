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
                    .setDescription("Check your Payroll as a DC Staff Member.");
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
                usd_amount: 0,
            });
        }

        // Payroll Embed
        const formattedUsdAmount = usdFormatter.format(
            currentPayroll.usd_amount as number
        );

        const payrollEmbed = new EmbedBuilder()
            .setAuthor({
                iconURL: interaction.user.displayAvatarURL(),
                name: `${interaction.user.username}`,
            })
            .setColor("#44f9fa")
            .addFields(
                {
                    name: "Role",
                    value: `${currentPayroll.current_role ? currentPayroll.current_role : "No Role"}`,
                },
                {
                    name: "Current Balance",
                    value: `${formattedUsdAmount}`,
                }
            )
            .setTimestamp();

        // Return Response
        return interaction.editReply({
            embeds: [payrollEmbed],
        });
    }
}

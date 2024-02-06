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
                    .setName("userinfo")
                    .setDescription("See a user's info and linked accounts.")
                    .addUserOption((option) =>
                        option
                            .setName("user")
                            .setDescription("The user to check the info of.")
                            .setRequired(true)
                    )
                    .setDefaultMemberPermissions(
                        PermissionFlagsBits.ModerateMembers
                    );
            },
            {
                guildIds: [globalConfig.staffGuild],
            }
        );
    }

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        // Defer Reply
        await interaction.deferReply();

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
        const formattedUsdAmount = usdFormatter.format(currentPayroll.usd_amount as number)

        // Return Response
        return interaction.editReply(`$${formattedUsdAmount}`)
    }
}

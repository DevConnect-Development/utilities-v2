// Dependencies
import globalConfig from "../../config.js";

import { Subcommand } from "@sapphire/plugin-subcommands";

// Formatter
const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});
const robuxFormatter = new Intl.NumberFormat("en-US");

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
                    name: "devex",
                    chatInputRun: "convertDevex",
                },
                {
                    name: "purchase",
                    chatInputRun: "convertPurchase",
                },
            ],
        });
    }

    registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand(
            (builder) => {
                builder
                    .setName("convert")
                    .setDescription("Convert Robux to USD.")
                    .addSubcommand((command) =>
                        command
                            .setName("devex")
                            .setDescription(
                                "Convert Robux to the Developer Exchange rate."
                            )
                            .addNumberOption((option) =>
                                option
                                    .setName("amount")
                                    .setDescription(
                                        "The amount of Robux to convert"
                                    )
                                    .setRequired(true)
                            )
                    )
                    .addSubcommand((command) =>
                        command
                            .setName("purchase")
                            .setDescription("Convert Robux to purchase price.")
                            .addNumberOption((option) =>
                                option
                                    .setName("amount")
                                    .setDescription(
                                        "The amount of Robux to convert"
                                    )
                                    .setRequired(true)
                            )
                    );
            },
            {
                guildIds: [
                    globalConfig.communityGuild,
                    globalConfig.developmentGuild,
                ],
            }
        );
    }

    public async convertDevex(
        interaction: Subcommand.ChatInputCommandInteraction
    ) {
        await interaction.deferReply();
        const robuxAmount = interaction.options.getNumber("amount");

        // Parameter Check
        if (!robuxAmount) {
            return await interaction.editReply("Interaction has failed.");
        }

        // Variables
        const conversionRate = robuxAmount * 0.0035;

        // Return Reply
        return await interaction.editReply(
            `\`R$${robuxFormatter.format(
                robuxAmount
            )}\` is equal to approximately \`${formatter.format(
                conversionRate
            )} USD\` with Developer Exchange.`
        );
    }

    public async convertPurchase(
        interaction: Subcommand.ChatInputCommandInteraction
    ) {
        await interaction.deferReply();
        const robuxAmount = interaction.options.getNumber("amount");

        // Parameter Check
        if (!robuxAmount) {
            return await interaction.editReply("Interaction has failed.");
        }

        // Variables
        const conversionRate = robuxAmount * 0.0125;

        // Return Reply
        return await interaction.editReply(
            `\`R$${robuxFormatter.format(
                robuxAmount
            )}\` is equal to approximately \`${formatter.format(
                conversionRate
            )} USD\` if you were to purchase.`
        );
    }
}

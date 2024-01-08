// Dependencies
import { Command } from "@sapphire/framework";

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
                )
        );
    }

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        // Defer Reply
        const deferredReply = await interaction.deferReply();

        // Variables
        const commandType = interaction.options.getSubcommand();
        const robuxAmount = interaction.options.getNumber("amount");

        // Exist Check
        if(!robuxAmount) {
            return await interaction.editReply("Interaction has failed.")
        }

        // Conversion Variables
        const devExConversion = robuxAmount * 0.0035;
        const purchaseConversion = robuxAmount * 0.0125;

        // Formatter
        const formatter = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        });
        const robuxFormatter = new Intl.NumberFormat("en-US");

        // Send Robux Conversion Data
        if (robuxAmount % 1 == 0) {
            switch (commandType) {
                case "devex": {
                    return await interaction.editReply(
                        `\`R$${robuxFormatter.format(
                            robuxAmount
                        )}\` is equal to approximately \`${formatter.format(
                            devExConversion
                        )} USD\` with Developer Exchange.`
                    );
                }

                case "purchase": {
                    return await interaction.editReply(
                        `\`R$${robuxFormatter.format(
                            robuxAmount
                        )}\` is equal to approximately \`${formatter.format(
                            purchaseConversion
                        )} USD\` if you were to purchase.`
                    );
                }

                default: {
                    return await interaction.editReply("Failed to convert.");
                }
            }
        } else {
            return await interaction.editReply(
                "Please only provide a whole number of Robux for us to convert. Do not include decimals."
            );
        }
    }
}

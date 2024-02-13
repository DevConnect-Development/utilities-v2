// Dependencies
import globalConfig from "@config";
import { createPanel } from "@services/ApplicationService/index";

import { Command } from "@sapphire/framework";

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
                    .setName("apply")
                    .setDescription("Application management panel.");
            },
            {
                guildIds: [globalConfig.developmentGuild],
            }
        );
    }

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        // Defer Reply
        await interaction.deferReply({
            ephemeral: true,
        });

        // Variables
        const currentPanel = await createPanel();

        // Return Reply
        return await interaction.editReply({
            components: [currentPanel.components],
        });
    }
}

// Dependencies
import globalConfig from "../../config.js";

import { Subcommand } from "@sapphire/plugin-subcommands";
import { PermissionFlagsBits, Guild, ChannelType } from "discord.js";

// Schemas
import ChannelConfig from "../../util/schemas/config/channel.js";

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
                    name: "misc",
                    chatInputRun: "runCommand",
                },
                {
                    name: "logs",
                    chatInputRun: "runCommand",
                },
                {
                    name: "forums",
                    chatInputRun: "runCommand",
                },
                {
                    name: "bot",
                    chatInputRun: "runCommand",
                },
            ],
        });
    }

    registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand(
            (builder) => {
                builder
                    .setName("sc")
                    .setDescription("Set the channel for a specific key.")
                    .addSubcommand((command) =>
                        command
                            .setName("misc")
                            .setDescription(
                                "Set channel keys in the 'Miscellaneous' category."
                            )
                            .addStringOption((option) =>
                                option
                                    .setName("key")
                                    .setDescription(
                                        "The key that you would like the set the value of."
                                    )
                                    .addChoices(
                                        {
                                            name: "Creations",
                                            value: "creations",
                                        },
                                        {
                                            name: "Best Creations",
                                            value: "best_creations",
                                        },
                                        {
                                            name: "Status Notices",
                                            value: "status_notices",
                                        }
                                    )
                                    .setRequired(true)
                            )
                            .addChannelOption((option) =>
                                option
                                    .setName("channel")
                                    .setDescription(
                                        "The channel that you would like to set for this key."
                                    )
                                    .addChannelTypes(ChannelType.GuildText)
                                    .setRequired(true)
                            )
                    )
                    .addSubcommand((command) =>
                        command
                            .setName("logs")
                            .setDescription(
                                "Set channel keys in the 'Logs' category."
                            )
                            .addStringOption((option) =>
                                option
                                    .setName("key")
                                    .setDescription(
                                        "The key that you would like the set the value of."
                                    )
                                    .addChoices(
                                        {
                                            name: "Message Logs",
                                            value: "message_logs",
                                        },
                                        {
                                            name: "Member Logs",
                                            value: "member_logs",
                                        },
                                        {
                                            name: "Moderation Logs",
                                            value: "moderation_logs",
                                        }
                                    )
                                    .setRequired(true)
                            )
                            .addChannelOption((option) =>
                                option
                                    .setName("channel")
                                    .setDescription(
                                        "The channel that you would like to set for this key."
                                    )
                                    .addChannelTypes(ChannelType.GuildText)
                                    .setRequired(true)
                            )
                    )
                    .addSubcommand((command) =>
                        command
                            .setName("forums")
                            .setDescription(
                                "Set channel keys in the 'Forums' category."
                            )
                            .addStringOption((option) =>
                                option
                                    .setName("key")
                                    .setDescription(
                                        "The key that you would like the set the value of."
                                    )
                                    .addChoices({
                                        name: "Help Channel",
                                        value: "help_forum",
                                    })
                                    .setRequired(true)
                            )
                            .addChannelOption((option) =>
                                option
                                    .setName("channel")
                                    .setDescription(
                                        "The channel that you would like to set for this key."
                                    )
                                    .addChannelTypes(ChannelType.GuildForum)
                                    .setRequired(true)
                            )
                    )
                    .addSubcommand((command) =>
                        command
                            .setName("bot")
                            .setDescription(
                                "Set channel keys in the 'Bot' category."
                            )
                            .addStringOption((option) =>
                                option
                                    .setName("key")
                                    .setDescription(
                                        "The key that you would like the set the value of."
                                    )
                                    .addChoices(
                                        {
                                            name: "Bot Updates",
                                            value: "bot_updates",
                                        },
                                        {
                                            name: "Bot Releases",
                                            value: "bot_releases",
                                        }
                                    )
                                    .setRequired(true)
                            )
                            .addChannelOption((option) =>
                                option
                                    .setName("channel")
                                    .setDescription(
                                        "The channel that you would like to set for this key."
                                    )
                                    .addChannelTypes(ChannelType.GuildText)
                                    .setRequired(true)
                            )
                    )
                    .setDefaultMemberPermissions(
                        PermissionFlagsBits.Administrator
                    );
            },
            {
                guildIds: [
                    globalConfig.communityGuild,
                    globalConfig.staffGuild,
                    globalConfig.developmentGuild,
                ],
            }
        );
    }

    public async runCommand(
        interaction: Subcommand.ChatInputCommandInteraction
    ) {
        // Defer Reply
        await interaction.deferReply({
            ephemeral: true,
        });

        // Variables
        const currentGuild = interaction.guild! as Guild;

        const editKey = interaction.options.getString("key");
        const editChannel = interaction.options.getChannel("channel");

        // Parameter Check
        if (!editKey || !editChannel) {
            return await interaction.editReply("Interaction has failed.");
        }

        // Configuration Check
        let selectedConfiguration = await ChannelConfig.findOne({
            guild_id: interaction.guildId,
            channel_key: editKey,
        });

        if (!selectedConfiguration) {
            selectedConfiguration = await ChannelConfig.create({
                guild_id: currentGuild.id,
                channel_key: editKey,
            });
        }

        // Update Configuration
        await selectedConfiguration.updateOne({
            channel_id: editChannel.id,
        });

        // Return Reply
        return await interaction.editReply(
            `Successfully set the key \`${editKey}\` to ${editChannel}.`
        );
    }
}

// Dependencies
import globalConfig from "../../config.js";

import moment from "moment";
import "moment-timezone";

import { Command } from "@sapphire/framework";
import {
    PermissionFlagsBits,
    Guild,
    GuildMember,
    TextChannel,
    Role,
    EmbedBuilder,
} from "discord.js";

// Schemas
import channels from "../../util/schemas/config/channel.js";

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
                    .setName("servicestatus")
                    .setDescription("Send a service status message.")
                    .setDefaultMemberPermissions(
                        PermissionFlagsBits.Administrator
                    )
                    .addStringOption((option) =>
                        option
                            .setName("status")
                            .setDescription(
                                "The service status that you would like to send."
                            )
                            .setRequired(true)
                            .addChoices(
                                {
                                    name: "Operational",
                                    value: "1",
                                },
                                {
                                    name: "Resolving",
                                    value: "2",
                                },
                                {
                                    name: "Service Distruption",
                                    value: "3",
                                }
                            )
                    )
                    .addStringOption((option) =>
                        option
                            .setName("message")
                            .setDescription(
                                "An additional message that you would like to add."
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

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        // Defer Reply
        await interaction.deferReply({
            ephemeral: true,
        });

        // Variables
        const currentTime = moment().tz("America/New_York").format("lll");
        const currentGuild = interaction.guild! as Guild;
        const currentMember = interaction.member! as GuildMember;

        const chosenStatus = interaction.options.getString("status");
        const addedMessage = interaction.options.getString("message");

        // Roles
        const operationalRole = currentGuild.roles.cache.find(
            (r) => r.name === "Operational"
        );
        const resolvingRole = currentGuild.roles.cache.find(
            (r) => r.name === "Resolving"
        );
        const distruptionRole = currentGuild.roles.cache.find(
            (r) => r.name === "Service Disruption"
        );

        // Role Existence Check
        if (!operationalRole || !resolvingRole || !distruptionRole) {
            return await interaction.editReply("Interaction has failed.");
        }

        let currentText: Array<String> = [];
        let currentStatus: Role;

        // Status Channel
        const statusNotices = await channels.findOne({
            guild_id: interaction.guild?.id,
            channel_key: "status_notices",
        });
        const statusNoticesChannel = this.container.client.channels.cache.find(
            (c) => c.id === statusNotices?.channel_id
        ) as TextChannel;

        // Check Status Key
        switch (chosenStatus) {
            case "1":
                currentStatus = operationalRole;
                statusNoticesChannel.setName("🟢┃status");
                break;
            case "2":
                currentStatus = resolvingRole;
                statusNoticesChannel.setName("🟡┃status");
                break;
            case "3":
                currentStatus = distruptionRole;
                statusNoticesChannel.setName("🔴┃status");
                break;
            default:
                return await interaction.editReply(
                    "Failed to set status as the received status couldn't be matched."
                );
        }

        // Set Status
        currentText.push(`> **Status:** ${currentStatus}`);

        // Set Description
        if (addedMessage) {
            currentText.push(`> **Description:** ${addedMessage}`);
        }

        // Status Embed
        const statusEmbed = new EmbedBuilder()
            .setTitle(`Bot Status - ${currentTime} EST`)
            .setColor(currentStatus.hexColor)
            .setDescription(currentText.join("\n"))
            .setFooter({
                text: `Sent by ${interaction.user.username}`,
                iconURL: `${
                    currentMember.displayAvatarURL() ||
                    interaction.user.displayAvatarURL()
                }`,
            });

        // Send Status Message
        statusNoticesChannel.send({
            embeds: [statusEmbed],
        });

        // Edit Reply
        return await interaction.editReply({
            content: `Successfully sent the status message to ${statusNoticesChannel}!`,
        });
    }
}

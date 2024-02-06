// Dependencies
import globalConfig from "../../../config.js";

import noblox from "noblox.js";
import { getRobloxInfo } from "../../../util/services/UserService/index.js";

import { Command } from "@sapphire/framework";
import { PermissionFlagsBits, EmbedBuilder } from "discord.js";

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
                guildIds: [
                    globalConfig.communityGuild,
                    globalConfig.developmentGuild,
                ],
            }
        );
    }

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        // Defer Reply
        const deferredReply = await interaction.deferReply();

        // Variables
        const selectedUser = interaction.options.getUser("user");

        const hiddenEmoji = interaction.guild!.emojis.cache.find(
            (e) => e.name === "Hidden"
        );
        const robloxEmoji = interaction.guild!.emojis.cache.find(
            (e) => e.name === "Roblox_Logo"
        );
        const discordEmoji = interaction.guild!.emojis.cache.find(
            (e) => e.name === "Discord_Logo"
        );

        // Options Check
        if (!selectedUser) {
            return await interaction.editReply("Interaction has failed.");
        }

        // Fetched Roblox User
        let linkedAccountString;

        // Fetch Roblox User
        const rblxUser = await getRobloxInfo(interaction, selectedUser);

        if (!rblxUser) {
            linkedAccountString = "No Account Linked";
        } else {
            const rblxUserData = await noblox.getUsernameFromId(
                rblxUser.robloxId
            );
            linkedAccountString = `${rblxUserData} ***(${rblxUser.robloxId})***`;
        }

        // Embeds
        const infoEmbed = new EmbedBuilder()
            .setTitle(`${selectedUser.username}'s User Information`)
            .setColor("#44f9fa")
            .addFields(
                {
                    name: `${robloxEmoji}  Roblox Account`,
                    value: `${hiddenEmoji} • ${linkedAccountString}`,
                },
                {
                    name: `${discordEmoji}  Discord Account`,
                    value: `${hiddenEmoji} • ${selectedUser.username} ***(${selectedUser.id})***`,
                }
            )
            .setFooter({
                text: "This command is actively in development.",
            });

        // Return Embed
        return await interaction.editReply({
            embeds: [infoEmbed],
        });
    }
}

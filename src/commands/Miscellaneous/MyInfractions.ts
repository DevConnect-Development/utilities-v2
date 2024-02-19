// Dependencies
import globalConfig from "@config";

import chunkArray from "@modules/Functions/ChunkArray";

import { Command } from "@sapphire/framework";
import { PaginatedMessage } from "@sapphire/discord.js-utilities";
import {
    PermissionFlagsBits,
    GuildMember,
    EmbedBuilder,
    ComponentType,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} from "discord.js";

// Schemas
import UserInfractions from "@schemas/Infractions/UserInfractions";

// Action Emojis
const actionEmojis = {
    Warning: "⚠️",
    Mute: "🔇",
    Ban: "🔨",
    Softban: "🔨",
};

// Command
export default class extends Command {
    constructor(
        context: Command.LoaderContext,
        options: Command.Options
    ) {
        super(context, {
            ...options,
        });
    }

    registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand(
            (builder) => {
                builder
                    .setName("myinfractions")
                    .setDescription("Check your infractions.")
            },
            {
                guildIds: [globalConfig.developmentGuild],
            }
        );
    }

    async chatInputRun(
        interaction: Command.ChatInputCommandInteraction
    ) {
        await interaction.deferReply({
            ephemeral: true,
        });

        // Variables
        const chosenUser = interaction.user

        // Pagination Config
        const newPagination = new PaginatedMessage();

        // Parameter Check
        if (!chosenUser) {
            return await interaction.editReply("Interaction has failed.");
        }

        // Get Infractions
        const userInfractions = await UserInfractions
            .find({
                user: chosenUser.id,
            })
            .sort("-timestamp_start");
        const userInfractionsLength = userInfractions.length;

        // Infractions Check
        if (userInfractions.length < 1) {
            return await interaction.editReply({
                content: "You have no infractions.",
                components: [],
            });
        }

        // Chunk Array
        const infractionChunks = chunkArray(userInfractions, 4);

        // Set Pagination Actions
        newPagination.setActions([
            {
                emoji: "⬅️",
                customId: "x-previous",
                type: ComponentType.Button,
                style: ButtonStyle.Primary,
                run: ({ handler }) => {
                    if (handler.index === 0) {
                        handler.index = handler.pages.length - 1;
                    } else {
                        --handler.index;
                    }
                },
            },
            {
                emoji: "➡️",
                customId: "x-next",
                type: ComponentType.Button,
                style: ButtonStyle.Primary,
                run: ({ handler }) => {
                    if (handler.index === handler.pages.length - 1) {
                        handler.index = 0;
                    } else {
                        ++handler.index;
                    }
                },
            },
        ]);

        // Loop Infractions
        infractionChunks.forEach(async (chunk) => {
            newPagination.addAsyncPageEmbed(async (embed) => {
                const embedDescription = [];

                for (const infraction of chunk) {
                    const infractionType = `${infraction.infraction_type}` as
                        | "Warning"
                        | "Mute"
                        | "Ban"
                        | "Softban";
                    const punishmentStart = `<t:${infraction.timestamp_start}:f>`;
                    let punishmentEnd;

                    if (infraction.timestamp_end !== null) {
                        punishmentEnd = `<t:${infraction.timestamp_end}:f>`;
                    } else {
                        punishmentEnd = "";
                    }

                    embedDescription.push(
                        [
                            `**\`${actionEmojis[infractionType]}\` ${infractionType}** - ${punishmentStart}`,
                            `\`${infraction.infraction_id}\`\n`,
                            punishmentEnd ? `Expires: ${punishmentEnd}` : "",
                            `Reason: **${infraction.infraction_reason}**`,
                        ]
                            .filter(Boolean)
                            .join("\n")
                    );
                }

                // Set Extra Embed Info
                embed
                    .setAuthor({
                        name: "Your Infractions",
                        iconURL: `${chosenUser!.displayAvatarURL()}`,
                    })
                    .setColor("Green")
                    .setDescription(
                        embedDescription.join(
                            "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                        )
                    )
                    .setFooter({
                        text: `${userInfractionsLength} Total Infractions`,
                    });

                // Return Embed
                return embed;
            });
        });

        // Run Pagination
        newPagination.run(interaction);
    }
}

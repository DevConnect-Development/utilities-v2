// Dependencies
import { Command } from "@sapphire/framework";
import { Guild, GuildMember, EmbedBuilder } from "discord.js";

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
                .setName("levels")
                .setDescription("View chat level information.")
        );
    }

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        // Defer Reply
        const deferredReply = await interaction.deferReply();

        // Variables
        const currentGuild = interaction.guild! as Guild;
        const currentMember = interaction.member! as GuildMember;

        // Functions
        async function getLevel(number: String) {
            return `Level **${number}**:`;
        }

        async function getRole(name: String) {
            const selectedRole = currentGuild.roles.cache.find(
                (r) => r.name === name
            );
            return selectedRole;
        }

        // Embed
        const levelEmbed = new EmbedBuilder()
            .setTitle("Chat Levels")
            .setColor("#44f9fa")
            .setDescription(
                [
                    "When chatting in the server, you will gain **15xp** per minute.",
                    "Special benefits and perks come along with certain levels.",
                ].join("\n")
            )
            .addFields(
                {
                    name: "Bronze",
                    value: [
                        `${await getLevel("1")} ${await getRole("Bronze I")}`,
                        `${await getLevel("3")} ${await getRole("Bronze II")}`,
                        `${await getLevel("6")} ${await getRole("Bronze III")}`,
                    ].join("\n"),
                    inline: true,
                },
                {
                    name: "Iron",
                    value: [
                        `${await getLevel("9")} ${await getRole("Iron I")}`,
                        `${await getLevel("12")} ${await getRole("Iron II")}`,
                        `${await getLevel("15")} ${await getRole("Iron III")}`,
                    ].join("\n"),
                    inline: true,
                },
                {
                    name: "Silver",
                    value: [
                        `${await getLevel("20")} ${await getRole("Silver I")}`,
                        `${await getLevel("25")} ${await getRole("Silver II")}`,
                        `${await getLevel("30")} ${await getRole(
                            "Silver III"
                        )}`,
                    ].join("\n"),
                    inline: true,
                },
                {
                    name: "Gold",
                    value: [
                        `${await getLevel("35")} ${await getRole("Gold I")}`,
                        `${await getLevel("40")} ${await getRole("Gold II")}`,
                        `${await getLevel("45")} ${await getRole(
                            "Gold III"
                        )}`,
                    ].join("\n"),
                    inline: true,
                },
                {
                    name: "Platinum",
                    value: [
                        `${await getLevel("50")} ${await getRole(
                            "Platinum I"
                        )}`,
                        `${await getLevel("60")} ${await getRole(
                            "Platinum II"
                        )}`,
                        `${await getLevel("70")} ${await getRole(
                            "Platinum III"
                        )}`,
                    ].join("\n"),
                    inline: true,
                }
            )
            .setFooter({
                text: `Requested by ${
                    currentMember.displayName || interaction.user.displayName
                }`,
                iconURL: `${
                    currentMember.displayAvatarURL() ||
                    interaction.user.displayAvatarURL()
                }`,
            });

        // Send Reply
        return await interaction.editReply({
            embeds: [levelEmbed],
        });
    }
}

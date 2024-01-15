// Dependencies
import { Command } from "@sapphire/framework";
import { PermissionFlagsBits, Guild, GuildMember, Role } from "discord.js";

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
                .setName("role")
                .setDescription("Set a user's role.")
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
                .addSubcommand((command) =>
                    command
                        .setName("all")
                        .setDescription("Add a role to all users in the guild.")
                        .addRoleOption((option) =>
                            option
                                .setName("role")
                                .setDescription("The role to give all users.")
                                .setRequired(true)
                        )
                )
                .addSubcommand((command) =>
                    command
                        .setName("remove")
                        .setDescription(
                            "Remove a role from all users in the guild."
                        )
                        .addRoleOption((option) =>
                            option
                                .setName("role")
                                .setDescription(
                                    "The role to remove from all users."
                                )
                                .setRequired(true)
                        )
                )
        );
    }

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        // Variables
        const currentGuild = interaction.guild! as Guild;
        const currentSubCommand = interaction.options.getSubcommand();

        const selectedRole = interaction.options.getRole("role") as Role;

        const formattedMembers = currentGuild.members.cache.map((m) => {
            return m;
        });

        // Options Check
        if (!currentSubCommand || !selectedRole) {
            return await interaction.reply({
                ephemeral: true,
                content: "Interaction has failed.",
            });
        }

        // Commands Switch
        switch (currentSubCommand) {
            case "all": {
                await interaction.reply("Starting to give out roles...");
                for (const m of formattedMembers) {
                    await m.roles.add(selectedRole).catch((e) => {
                        console.log("Failed to add role.");
                    });
                    console.log(m.displayName);
                }
                return await interaction.editReply("Gave all users the role.");
            }
            case "remove": {
                await interaction.reply("Starting to remove roles...");
                for (const m of formattedMembers) {
                    await m.roles.remove(selectedRole).catch((e) => {
                        console.log("Failed to remove role.");
                    });
                    console.log(m.displayName);
                }
                return await interaction.editReply(
                    "Removed the role from all users."
                );
            }
            default: {
                return await interaction.reply({
                    ephemeral: true,
                    content: "Interaction has failed.",
                });
            }
        }
    }
}

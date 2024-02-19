// Dependencies
import globalConfig from "@config";

import Timestring from "@modules/Functions/Timestring";
import moment from "moment";

import { Command } from "@sapphire/framework";
import { GuildMember, Guild, EmbedBuilder } from "discord.js";

// Schemas
import UserInfractions from "@schemas/Infractions/UserInfractions";
import ActiveMutes from "@schemas/Infractions/ActiveMutes";

// Functions
function userHasRole(user: GuildMember, role: String) {
    const roleCheck = user.roles.cache.find((r) => r.name === role);
    return roleCheck;
}

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
                    .setName("mute")
                    .setDescription("Mute a user.")
                    .addUserOption((option) =>
                        option
                            .setName("user")
                            .setDescription("The user you would like to mute.")
                            .setRequired(true)
                    )
                    .addStringOption((option) =>
                        option
                            .setName("type")
                            .setDescription("The type of mute.")
                            .addChoices(
                                {
                                    name: "Server Mute (Timeout)",
                                    value: "Server",
                                },
                                {
                                    name: "Marketplace Mute",
                                    value: "Marketplace",
                                },
                                {
                                    name: "Applications Mute",
                                    value: "Applications",
                                }
                            )
                            .setRequired(true)
                    )
                    .addStringOption((option) =>
                        option
                            .setName("length")
                            .setDescription("The length of the mute.")
                            .setRequired(true)
                    )
                    .addStringOption((option) =>
                        option
                            .setName("reason")
                            .setDescription("The reason for the mute.")
                            .setRequired(true)
                    )
                    .addStringOption((option) =>
                        option
                            .setName("evidence")
                            .setDescription("Separate evidence with commas.")
                            .setRequired(false)
                    );
            },
            {
                guildIds: [globalConfig.developmentGuild],
            }
        );
    }

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        await interaction.deferReply();

        // Variables
        const currentTimestamp = moment().unix();

        const selectedUser = interaction.options.getUser("user");
        const selectedMuteType = interaction.options.getString("type");
        const selectedMuteLength = interaction.options.getString("length");
        const selectedMuteReason = interaction.options.getString("reason");
        const selectedMuteEvidence = interaction.options.getString("evidence");

        let formattedEvidence: Array<String>;

        // Parameter Check
        if (
            !selectedUser ||
            !selectedMuteType ||
            !selectedMuteLength ||
            !selectedMuteReason
        ) {
            return await interaction.editReply("Interaction has failed.");
        }

        // More Variables
        const currentMember = interaction.member! as GuildMember;
        const currentGuild = interaction.guild! as Guild;

        const selectedMember = currentGuild.members.cache.get(
            selectedUser.id
        ) as GuildMember;

        // Evidence Verification
        if (selectedMuteEvidence) {
            formattedEvidence = selectedMuteEvidence.split(",");
        }

        // Permissions Check
        switch (selectedMuteType) {
            case "Server": {
                if (!userHasRole(currentMember, "Moderator")) {
                    return await interaction.editReply(
                        "Missing Required Permissions."
                    );
                }
            }

            case "Marketplace": {
                if (!userHasRole(currentMember, "Moderator")) {
                    return await interaction.editReply(
                        "Missing Required Permissions."
                    );
                }
            }

            case "Applications": {
                if (
                    !userHasRole(currentMember, "Application Reader")
                ) {
                    return await interaction.editReply(
                        "Missing Required Permissions."
                    );
                }
            }
        }
    }
}

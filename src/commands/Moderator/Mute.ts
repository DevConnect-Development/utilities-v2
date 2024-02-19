// Dependencies
import globalConfig from "@config";

import Timestring from "@modules/Functions/Timestring";
import moment from "moment";

import { Command } from "@sapphire/framework";
import { GuildMember, Guild, EmbedBuilder, User } from "discord.js";

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

        let formattedEvidence: Array<String> = [];

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
        let muteFinishesTimestamp: String;

        // Roles
        const serverMuteRole = currentGuild.roles.cache.find(
            (r) => r.name === "Server Mute"
        );
        const marketplaceMuteRole = currentGuild.roles.cache.find(
            (r) => r.name === "Marketplace Mute"
        );

        // Evidence Verification
        if (selectedMuteEvidence) {
            formattedEvidence = selectedMuteEvidence.split(",");
        }

        // Permissions Check
        switch (selectedMuteType) {
            case "Server": {
                if (
                    !userHasRole(currentMember, "Moderator") &&
                    !userHasRole(currentMember, "Trial Moderator")
                ) {
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
                if (!userHasRole(currentMember, "Application Reader")) {
                    return await interaction.editReply(
                        "Missing Required Permissions."
                    );
                }
            }
        }

        // Validate Mute Time
        try {
            muteFinishesTimestamp = `${
                currentTimestamp + Timestring(selectedMuteLength, "seconds")
            }`;
        } catch (e) {
            return await interaction.editReply(
                "Failed to set mute length. Please ensure you wrote it correctly."
            );
        }

        // Add Mute Roles
        if(selectedMember) {
            switch(selectedMuteType) {
                case "Server": {
                    if(serverMuteRole) {
                        await selectedMember.roles.add(serverMuteRole)
                        break;
                    }
                }

                case "Marketplace": {
                    if(marketplaceMuteRole) {
                        await selectedMember.roles.add(marketplaceMuteRole)
                        break;
                    }
                }
            }
        }

        // Create DB Entries
        const activeMuteEntry = await ActiveMutes.create({
            guild_id: currentGuild.id,
            user_id: interaction.user.id,

            mute_type: selectedMuteType,
            mute_expires: muteFinishesTimestamp,
        });
        const infractionEntry = await UserInfractions.create({
            infraction_type: `${selectedMuteType} Mute`,

            infraction_user: selectedUser.id,
            infraction_moderator: interaction.user.id,

            infraction_reason: selectedMuteReason,
            attached_evidence: formattedEvidence,

            timestamp_start: currentTimestamp,
            timestamp_end: muteFinishesTimestamp,
        });

        // Return Reply
        return await interaction.editReply(
            `Successfully muted ${selectedUser} ***(${selectedUser.id})***.\nInfraction ID: \`${infractionEntry.id}\``
        );
    }
}

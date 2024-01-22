// Env
import { config } from "dotenv";
config();

// Dependencies
import axios from "axios";

import { Command } from "@sapphire/framework";
import { User } from "discord.js";

// Main Fucntion
export default async function getRobloxInfo(
    interaction: Command.ChatInputCommandInteraction,
    user: User
) {
    if (!interaction.guild) {
        return false;
    }

    const requestUrl = `https://registry.rover.link/api/guilds/${interaction.guild.id}/discord-to-roblox/${user.id}`;
    let apiRequest;

    try {
        apiRequest = await axios.get(requestUrl, {
            headers: {
                Authorization: `Bearer ${process.env.ROVER_KEY}`,
            },
        });
    } catch (e) {
        return false;
    }

    return {
        robloxId: Number(`${apiRequest.data.robloxId}`),
    };
}

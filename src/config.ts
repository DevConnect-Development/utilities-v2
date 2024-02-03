// Env
import { config } from "dotenv";
config();

// Config Export
export default {
    guildID: `${process.env.GUILD_ID}`,
    allowedGuilds: [`${process.env.GUILD_ID}`],

    clientToken: `${process.env.TOKEN}`,
    clientID: `${process.env.CLIENT_ID}`
};

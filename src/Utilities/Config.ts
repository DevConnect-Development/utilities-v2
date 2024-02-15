// Env
import { config } from "dotenv";
config();

// Config Export
export default {
    communityGuild: "1054956623182975068",
    staffGuild: "1203996871039651840",
    developmentGuild: "1193804554790260739",

    specificChannels: {
        staffSuggestions: "1207597236238819348"
    },

    clientToken: `${process.env.TOKEN}`,
    clientID: `${process.env.CLIENT_ID}`,

    trelloKey: `${process.env.TRELLO_KEY}`,
    trelloToken: `${process.env.TRELLO_TOKEN}`,
    
    roverToken: `${process.env.ROVER_KEY}`,
    databaseString: `${process.env.MONGO_URL}`,

    verifiedURLS: [
        "www.roblox.com",
        "web.roblox.com",
        "devforum.roblox.com",

        "artstation.com",
        "www.artstation.com",

        "deviantart.com",
        "www.deviantart.com",

        "discord.com",
        "www.discord.com",

        "youtube.com",
        "www.youtube.com",

        "twitter.com",
        "www.twitter.com",
        "x.com",
        "www.x.com",

        "github.com",
    ],

    skillApplicationDeclineReasons: {
        "Not_Sufficient": "You have not provided sufficient past work examples.",
        "Troll_Application": "The application you submitted was considered a Troll Application.",
    }
};

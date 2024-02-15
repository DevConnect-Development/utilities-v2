// Env
import { config } from "dotenv";
config();

// Config Export
export default {
    communityGuild: "1054956623182975068",
    staffGuild: "1203996871039651840",
    developmentGuild: "1193804554790260739",

    clientToken: `${process.env.TOKEN}`,
    clientID: `${process.env.CLIENT_ID}`,
    
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
    ]
};

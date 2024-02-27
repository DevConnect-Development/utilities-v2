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
};

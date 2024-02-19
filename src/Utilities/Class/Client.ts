// Dependencies
import globalConfig from "@config";

import { SapphireClient } from "@sapphire/framework";
import {
    ActivityType,
    GatewayIntentBits,
    Partials,
    REST,
    Routes,
} from "discord.js";

// Bot Class
export default class extends SapphireClient {
    constructor() {
        super({
            intents: [Object.keys(GatewayIntentBits) as any],
            partials: [Object.keys(Partials) as any],
            presence: {
                activities: [
                    {
                        type: ActivityType.Watching,
                        name: "developers connect.",
                    },
                ],
            },
        });
    }

    async start() {
        this.login(process.env.TOKEN);
    }

    async resetCommands() {
        const rest = new REST().setToken(globalConfig.clientToken);

        rest.put(Routes.applicationCommands(globalConfig.clientID), {
            body: [],
        })
            .then(() =>
                console.log("Successfully deleted all application commands.")
            )
            .catch(console.error);
    }
}

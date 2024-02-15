// Dependencies
import globalConfig from "@config";
import delay from "delay";

import { Listener } from "@sapphire/framework";
import {
    ThreadChannel
} from "discord.js";

// Schemas
import ChannelConfig from "@schemas/Config/ChannelConfig";

export default class extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "threadCreate",
        });
    }

    async run(thread: ThreadChannel) {
        // Variables
        const currentAuthor = await thread.fetchOwner();
        const helpChannelID = globalConfig.specificChannels.staffSuggestions;
        const trelloClient = this.container.trello

        // No Author?
        if(!currentAuthor?.user) {
            return;
        }

        // Send Help Embed
        if (thread.parentId === helpChannelID) {
            await delay(200);

            // Create Card
            return await trelloClient.cards.createCard({
                idList: "65cdc66e9519e41007405788",
                name: thread.name,
                desc: [
                    `Created by: **@${currentAuthor.user.username}**`
                ].join("\n")
            }).catch(e => {
                return;
            })
        }
    }
}

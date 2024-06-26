// Dependencies
import globalConfig from "@config";
import delay from "delay";

import { Listener } from "@sapphire/framework";
import { ThreadChannel, ForumChannel } from "discord.js";

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
        const currentMessage = await thread.fetchStarterMessage();
        const helpChannelID = globalConfig.specificChannels.staffSuggestions;
        const trelloClient = this.container.trello;

        // No Author?
        if (!currentAuthor?.user || !currentMessage) {
            return;
        }

        // Trello IDs
        type trelloTag = keyof typeof trelloIDs.labels;
        const trelloIDs = {
            suggestionsList: "65cdc66e9519e41007405788",

            labels: {
                Website: "65cdc5b934b1d6aee31ffbb5",
                Server: "65cdc5b934b1d6aee31ffbb0",
                "DevConnect Bot": "65cdc5b934b1d6aee31ffba9",
                "DC Moderation": "65cdc9a5233d306cb45b499c",
                Other: "65cdc9ab4651a22e0193177a",
            },
        };
        const formattedLabels = await Promise.all(thread.appliedTags.map(async (tag) => {
            const availableTags = (thread.parent as ForumChannel).availableTags;
            let currentTag;

            for (const foundTag of availableTags) {
                if (foundTag.id === tag) {
                    console.log(`Tag Found: ${foundTag.name}`);
                    currentTag = foundTag.name;
                }
            }

            console.log(`Returning ${trelloIDs.labels[currentTag as trelloTag]}`);
            return trelloIDs.labels[currentTag as trelloTag];
        }));

        // Send Help Embed
        if (thread.parentId === helpChannelID) {
            await delay(200);

            return await trelloClient.cards
                .createCard({
                    idList: "65cdc66e9519e41007405788",
                    name: thread.name,
                    desc: [
                        `**Origin:** DevConnect Bot Suggestions Collector`,
                        `**Submitter:** @${currentAuthor.user.username} \`(${currentAuthor.id})\``,
                        `**Submission Link:** [Click Here](${thread.url})`,
                        ``,
                        `\`\`\`${currentMessage.content}\`\`\``,
                    ].join("\n"),
                    idLabels: [...formattedLabels],
                })
                .catch((e) => {
                    return;
                });
        }
    }
}

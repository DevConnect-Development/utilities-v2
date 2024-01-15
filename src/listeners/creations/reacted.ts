// Dependencies
import channelConfig from "../../util/schemas/config/channel.js";
import bestCreations from "../../util/schemas/misc/bestCreations.js";

import { Listener } from "@sapphire/framework";
import {
    MessageReaction,
    Guild,
    User,
    Message,
    TextChannel,
    EmbedBuilder,
} from "discord.js";

export default class extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "messageReactionAdd",
        });
    }

    async run(reaction: MessageReaction, user: User) {
        // Guild Check
        if (!reaction.message.guild) {
            return;
        }

        // Variables
        const minimumReactions = 6;

        const currentMessage = reaction.message! as Message;
        const currentGuild = reaction.message.guild! as Guild;
        const currentAuthor = reaction.message.author! as User;

        // Creations Channel
        const creationsChannel = await channelConfig.findOne({
            channel_key: "creations",
        });

        // Best Creations
        const bestCreationsC = await channelConfig.findOne({
            channel_key: "bestcreations",
        });
        const bestCreationsChannel = currentGuild.channels.cache.find(
            (ch) => ch.id === bestCreationsC?.channel_id
        ) as TextChannel;

        // Exist Check
        if (!creationsChannel) {
            return;
        }
        if (!bestCreationsC || !bestCreationsChannel) {
            return;
        }
        if (await bestCreations.exists({ creation_id: reaction.message.id })) {
            return;
        }

        // Embeds
        const featuredEmbed = new EmbedBuilder()
            .setAuthor({
                name: `${currentAuthor.username}`,
                iconURL: `${currentAuthor.displayAvatarURL()}`,
            })
            .setColor("#FFD700")
            .setTitle(`Featured Creation`)
            .setURL(currentMessage.url)

        if (currentMessage.content.length > 0) {
            featuredEmbed.setDescription(currentMessage.content);
        }

        if(currentMessage.attachments.size > 0) {
            featuredEmbed.setImage(currentMessage.attachments.first()!.url)
        }

        // Check if Channel Matches
        if (reaction.message.channelId === creationsChannel.channel_id) {
            // Check if Emoji Matches
            if (reaction.emoji.name === "⭐") {
                // Check Minimum Reactions
                if (reaction.count >= minimumReactions) {
                    // Create DB Entry
                    await bestCreations.create({
                        user_id: currentAuthor.id,
                        creation_id: currentMessage.id
                    })

                    // Send Featured Message
                    return await bestCreationsChannel.send({
                        content: `${currentAuthor}`,
                        embeds: [featuredEmbed],
                    });
                }
            }
        }
    }
}

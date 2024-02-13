// Dependencies
import globalConfig from "@config";
import { Listener } from "@sapphire/framework";
import {
    MessageReaction,
    Guild,
    User,
    Message,
    TextChannel,
    EmbedBuilder,
} from "discord.js";

// Schemas
import ChannelConfig from "@schemas/Config/ChannelConfig";
import BestCreations from "@schemas/Miscellaneous/BestCreations";

export default class extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "messageReactionAdd",
        });
    }

    async run(reaction: MessageReaction) {
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
        const creationsKey = await ChannelConfig.findOne({
            guild_id: globalConfig.communityGuild,
            channel_key: "creations",
        });

        // Best Creations
        const bestCreationsKey = await ChannelConfig.findOne({
            guild_id: globalConfig.communityGuild,
            channel_key: "best_creations",
        });
        const bestCreationsChannel = currentGuild.channels.cache.find(
            (ch) => ch.id === bestCreationsKey?.channel_id
        ) as TextChannel;

        // Exist Check
        if (!creationsKey || !bestCreationsKey || !bestCreationsChannel) {
            return;
        }
        if (await BestCreations.exists({ creation_id: reaction.message.id })) {
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
            .setURL(currentMessage.url);

        if (currentMessage.content.length > 0) {
            featuredEmbed.setDescription(currentMessage.content);
        }

        if (currentMessage.attachments.size > 0) {
            featuredEmbed.setImage(currentMessage.attachments.first()!.url);
        }

        if (reaction.message.channelId !== creationsKey.channel_id) return; // Check Channel ID
        if (reaction.count < minimumReactions) return; // Check Minimum Reactions
        if (reaction.emoji.name !== "⭐") return; // Check Emoji

        // Create Best Creation in DB
        await BestCreations.create({
            user_id: currentAuthor.id,
            creation_id: currentMessage.id,
        });

        // Send Best Creation Embed
        return await bestCreationsChannel.send({
            content: `${currentAuthor}`,
            embeds: [featuredEmbed],
        });
    }
}

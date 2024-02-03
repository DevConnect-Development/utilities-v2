// Dependencies
import { Listener } from "@sapphire/framework";
import { Message } from "discord.js";

// Schemas
import channels from "../../util/schemas/config/channel.js";

export default class extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "messageCreate",
        });
    }

    async run(message: Message) {
        // Creations Channel
        const creationsChannel = await channels.findOne({
            channel_key: "creations",
        });
        if (!creationsChannel) {
            return;
        }

        // Channel Check
        if (message.channelId == creationsChannel.channel_id) {
            // React if Attachment or Link
            if (await message.attachments.size > 0 || await message.embeds.length > 0) {
                return await message.react("⭐");
            }

            // Delete Message
            return await message.delete();
        }
    }
}

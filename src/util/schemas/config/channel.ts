import { Schema, model } from "mongoose"

let currentSchema = new Schema({
    guild_id: String,
    channel_key: String,
    channel_id: String,
})

export default model("Channel Config", currentSchema, "Channel Config")
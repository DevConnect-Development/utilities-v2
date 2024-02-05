// Dependencies
import { Schema, model } from "mongoose"

// Current Schema
const schemaName = "Channel Config"
let currentSchema = new Schema({
    guild_id: String,

    channel_key: String,
    channel_id: String,
})

// Export Model
export default model(schemaName, currentSchema, schemaName)
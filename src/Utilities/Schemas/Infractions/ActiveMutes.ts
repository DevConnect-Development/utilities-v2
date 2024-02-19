// Dependencies
import { Schema, model } from "mongoose";

// Current Schema
const schemaName = "Active Mutes";
let currentSchema = new Schema({
    guild_id: String,
    user_id: String,

    mute_type: String,

    mute_expires: String,
    mute_failed: Boolean,
});

// Export Model
export default model(schemaName, currentSchema, schemaName);

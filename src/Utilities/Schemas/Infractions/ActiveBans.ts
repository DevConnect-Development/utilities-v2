// Dependencies
import { Schema, model } from "mongoose";

// Current Schema
const schemaName = "Active Bans";
let currentSchema = new Schema({
    guild_id: String,
    user_id: String,

    ban_expires: String,
    ban_failed: Boolean,
});

// Export Model
export default model(schemaName, currentSchema, schemaName);

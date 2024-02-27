// Dependencies
import { customAlphabet } from "nanoid";
import { Schema, model } from "mongoose";

// Current Schema
const schemaName = "User Infractions";
let currentSchema = new Schema({
    infraction_id: {
        type: String,
        default: () => {
            const id = customAlphabet("1234567890");

            return id(18);
        },
    },
    infraction_type: String,
    infraction_emoji: String,
    
    infraction_reverted: Boolean,

    infraction_user: String,
    infraction_moderator: String,

    infraction_reason: String,
    attached_evidence: Array<String>,

    timestamp_start: String,
    timestamp_end: String,
});

// Export Model
export default model(schemaName, currentSchema, schemaName);

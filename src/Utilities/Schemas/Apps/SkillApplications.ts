// Dependencies
import { customAlphabet } from "nanoid";
import { Schema, model } from "mongoose";

// Current Schema
const schemaName = "Skill Applications";
let currentSchema = new Schema({
    app_id: {
        type: String,
        default: () => {
            const id = customAlphabet("1234567890");

            return id(18);
        },
    },
    app_role: String,
    app_status: String,

    app_claimant: String,
    app_reviewer: String,
    app_declinereasons: Array<String>,

    author_id: String,

    provided_comment: String,
    provided_work: Array,
});

// Export Model
export default model(schemaName, currentSchema, schemaName);

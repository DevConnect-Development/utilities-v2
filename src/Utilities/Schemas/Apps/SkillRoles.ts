// Dependencies
import { Schema, model } from "mongoose";

// Current Schema
const schemaName = "Skill Roles";
let currentSchema = new Schema({
    user_id: String,
    skill_role: String,
});

// Export Model
export default model(schemaName, currentSchema, schemaName);

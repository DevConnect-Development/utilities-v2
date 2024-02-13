// Dependencies
import { Schema, model } from "mongoose"

// Current Schema
const schemaName = "Best Creations"
let currentSchema = new Schema({
    user_id: String,
    creation_id: String
});

// Export Model
export default model(schemaName, currentSchema, schemaName)

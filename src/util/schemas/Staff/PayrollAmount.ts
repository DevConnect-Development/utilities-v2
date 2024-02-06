// Dependencies
import { Schema, model } from "mongoose";

// Current Schema
const schemaName = "Payroll Amount";
let currentSchema = new Schema({
    user_id: String,
    current_role: String,
    
    usd_amount: Number,
});

// Export Model
export default model(schemaName, currentSchema, schemaName);

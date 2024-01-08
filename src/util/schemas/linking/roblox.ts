import { Schema, model } from "mongoose"

let currentSchema = new Schema({
    discord_id: String,
    roblox_id: String,
    
    verification_phrase: String,

    is_complete: Boolean
})

export default model("Roblox Linking", currentSchema, "Roblox Linking")
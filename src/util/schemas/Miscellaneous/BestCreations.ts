import { Schema, model } from "mongoose";

let currentSchema = new Schema({
    user_id: String,
    creation_id: String
});

export default model("Best Creations", currentSchema, "Best Creations");

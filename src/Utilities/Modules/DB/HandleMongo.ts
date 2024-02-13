// Dependencies
import globalConfig from "@config";
import mongoose from "mongoose";

// Variables
const dbString = globalConfig.databaseString;
let Client: any;

export async function databaseConnect() {
    try {
        Client = await mongoose.connect(dbString);
    } catch (e) {
        return console.error("Failed to connect to MongoDB.");
    }

    return console.log("Successfully connected to MongoDB.");
}

export async function databaseClose() {
    try {
        await Client.close();
    } catch (e) {
        return console.error("Failed to close MongoDB connection.");
    }

    return console.log("Successfully closed MongoDB connection.");
}

export default Client;

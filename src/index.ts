// Dependencies
import { databaseConnect } from "@modules/DB/HandleMongo";
import botClient from "@/class/client";

// Create Client
const Client = new botClient();
await databaseConnect();
Client.start();

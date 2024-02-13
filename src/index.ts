// Dependencies
import { databaseConnect } from "@modules/mongodb";
import botClient from "@/class/client";

// Create Client
const Client = new botClient();
await databaseConnect();
Client.start();

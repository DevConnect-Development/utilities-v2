// Dependencies
import { databaseConnect } from "@modules/DB/HandleMongo";
import { createTrelloClient } from "./Utilities/Modules/DB/TrelloClient";
import botClient from "@/Utilities/Class/Client";

// Create Client
const Client = new botClient();
await databaseConnect();
await createTrelloClient();
Client.start();

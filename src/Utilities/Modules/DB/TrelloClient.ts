// Dependencies
import globalConfig from "@config";
import { TrelloClient } from "trello.js";

import { container } from "@sapphire/framework";

export async function createTrelloClient() {
    const trello = new TrelloClient({
        key: globalConfig.trelloKey,
        token: globalConfig.trelloToken,
    });

    container.trello = trello;
    return trello;
}

declare module "@sapphire/pieces" {
    interface Container {
        trello: TrelloClient;
    }
}

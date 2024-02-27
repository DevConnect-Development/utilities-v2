// Env
import { config } from "dotenv";
config();

// Config Export
export default {
    skillApplicationDeclineReasons: {
        "Not_Sufficient": "You have not provided sufficient past work examples.",
        "Troll_Application": "The application you submitted was considered a Troll Application.",
    }
};

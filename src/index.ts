import { startBot } from "./bot/bayley.js";
import { startCron } from "./scheduler/cron.js";
import { startWebServer } from "./web/server.js";

// Start web dashboard
startWebServer();

// Start WhatsApp bot
startBot().then((sock) => {
  console.log("Bot berjalan...");
  startCron(sock);
});

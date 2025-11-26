import { startBot } from "./bot/bayley.js";
import { startCron } from "./scheduler/cron.js";

startBot().then((sock) => {
  console.log("Bot berjalan...");
  startCron(sock);
});

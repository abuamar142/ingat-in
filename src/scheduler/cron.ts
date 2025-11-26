import cron from "node-cron";
import { sendReminder } from "./reminder.js";
import type { BotSocket } from "../types/index.js";

export function startCron(sock: BotSocket): void {
  // Pagi: Jam 06:00
  cron.schedule("0 6 * * *", () => {
    console.log("Reminder pagi...");
    sendReminder(sock, "pagi");
  });

  // Sore: Jam 16:00
  cron.schedule("0 16 * * *", () => {
    console.log("Reminder sore...");
    sendReminder(sock, "sore");
  });

  // Reminder ulang setiap 5 menit
  cron.schedule("*/5 * * * *", () => {
    console.log("Reminder ulang...");
    sendReminder(sock, "pagi"); // kamu bisa buat logika pembagian waktu
  });
}

import cron from "node-cron";
import { sendReminder } from "./reminder.js";
import { resetAbsenPagi, resetAbsenSore } from "./reset.js";
import type { BotSocket } from "../types/index.js";

export function startCron(sock: BotSocket): void {
  console.log("⏰ Scheduler dimulai...\n");

  // Reset absen pagi jam 00:01 (tengah malam)
  cron.schedule("1 0 * * *", () => {
    console.log("🌙 Tengah malam - Reset absen pagi...");
    resetAbsenPagi();
  });

  // Pagi: Jam 06:00
  cron.schedule("0 6 * * *", () => {
    console.log("🌅 Pagi - Mengirim reminder absen pagi...");
    sendReminder(sock, "pagi");
  });

  // Reset absen sore jam 12:00 (siang)
  cron.schedule("0 12 * * *", () => {
    console.log("☀️ Siang - Reset absen sore...");
    resetAbsenSore();
  });

  // Sore: Jam 16:00
  cron.schedule("0 16 * * *", () => {
    console.log("🌆 Sore - Mengirim reminder absen sore...");
    sendReminder(sock, "sore");
  });

  // Reminder ulang setiap 30 menit untuk yang belum absen
  cron.schedule("*/30 * * * *", () => {
    const hour = new Date().getHours();
    // Pagi (06:00 - 11:59)
    if (hour >= 6 && hour < 12) {
      console.log("🔔 Reminder ulang - Absen pagi...");
      sendReminder(sock, "pagi");
    }
    // Sore (16:00 - 23:59)
    else if (hour >= 16) {
      console.log("🔔 Reminder ulang - Absen sore...");
      sendReminder(sock, "sore");
    }
  });
}

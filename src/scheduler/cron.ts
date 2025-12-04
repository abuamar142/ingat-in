import cron from "node-cron";
import { sendReminder } from "./reminder.js";
import { resetAllAbsen } from "./reset.js";
import type { BotSocket } from "../types/index.js";
import { SCHEDULE, LOCALE } from "../constants/constants.js";
import { markCompletedLeaves } from "../utils/leaves.js";

export function startCron(sock: BotSocket): void {
  console.log("⏰ Scheduler dimulai...\n");

  // Cek setiap 5 menit untuk semua operasi
  cron.schedule(SCHEDULE.REMINDER_INTERVAL, () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const time = now.toLocaleTimeString(LOCALE);

    // Reset absen jam 00:00 atau 00:05 (tengah malam)
    if (hour === 0 && minute <= 5) {
      console.log("🌙 Tengah malam - Reset semua absen...");
      resetAllAbsen();
      console.log("🔄 Marking completed leaves...");
      markCompletedLeaves();
      return;
    }

    // Reminder pagi jam 08:00
    if (hour === 8 && minute === 0) {
      console.log(`🌅 [${time}] Pagi - Mengirim reminder absen pagi...`);
      sendReminder(sock, "pagi");
      return;
    }

    // Reminder sore jam 17:00
    if (hour === 17 && minute === 0) {
      console.log(`🌆 [${time}] Sore - Mengirim reminder absen sore...`);
      sendReminder(sock, "sore");
      return;
    }

    // Reminder ulang pagi (08:05 - 11:59)
    if (hour >= 8 && hour < 12 && (hour > 8 || minute >= 5)) {
      console.log(`🔔 [${time}] Reminder ulang - Absen pagi...`);
      sendReminder(sock, "pagi");
      return;
    }

    // Reminder ulang sore (17:05 - 23:59)
    if (hour >= 17 && (hour > 17 || minute >= 5)) {
      console.log(`🔔 [${time}] Reminder ulang - Absen sore...`);
      sendReminder(sock, "sore");
      return;
    }

    // Log untuk debugging - kenapa tidak kirim
    console.log(`⏸️ [${time}] Tidak ada reminder (jam: ${hour}:${minute})`);
  });
}

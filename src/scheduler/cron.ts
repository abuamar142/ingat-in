import cron from "node-cron";
import { sendReminder } from "./reminder.js";
import { resetAllAbsen } from "./reset.js";
import type { BotSocket } from "../types/index.js";
import { SCHEDULE, LOCALE } from "../constants/constants.js";

export function startCron(sock: BotSocket): void {
  console.log("⏰ Scheduler dimulai...\n");

  // Reset absen jam 00:01 (tengah malam)
  cron.schedule(SCHEDULE.RESET_ABSEN, () => {
    console.log("🌙 Tengah malam - Reset semua absen...");
    resetAllAbsen();
  });

  // Pagi: Jam 08:00
  cron.schedule(SCHEDULE.REMINDER_PAGI, () => {
    console.log("🌅 Pagi - Mengirim reminder absen pagi...");
    sendReminder(sock, "pagi");
  });

  // Sore: Jam 17:00
  cron.schedule(SCHEDULE.REMINDER_SORE, () => {
    console.log("🌆 Sore - Mengirim reminder absen sore...");
    sendReminder(sock, "sore");
  });

  // Reminder ulang setiap 5 menit untuk yang belum absen
  cron.schedule(SCHEDULE.REMINDER_INTERVAL, () => {
    const now = new Date();
    const hour = now.getHours();
    const time = now.toLocaleTimeString(LOCALE);

    // Pagi (08:00 - 11:59)
    if (hour >= 8 && hour < 12) {
      console.log(`🔔 [${time}] Reminder ulang - Absen pagi...`);
      sendReminder(sock, "pagi");
    }

    // Sore (17:00 - 23:59)
    else if (hour >= 17) {
      console.log(`🔔 [${time}] Reminder ulang - Absen sore...`);
      sendReminder(sock, "sore");
    } else {
      // Log untuk debugging - kenapa tidak kirim
      console.log(`⏸️ [${time}] Tidak ada reminder (jam: ${hour})`);
    }
  });
}

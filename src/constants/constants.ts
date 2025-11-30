// Bot command constants
/**
 * Configuration constants for Ingat-In Bot
 * 
 * Centralized configuration untuk commands, validation, dan scheduler.
 * Edit file ini untuk mengubah behavior bot.
 */

// Public commands - tidak perlu autentikasi
export const PUBLIC_COMMANDS = ["halo", "hi", "hello", "daftar", "help", "menu"] as const;
export type PublicCommand = (typeof PUBLIC_COMMANDS)[number];

// Auth commands - perlu autentikasi (user sudah terdaftar & punya nama)
export const AUTH_COMMANDS = ["sudah", "status", "stats", "suspend"] as const;
export type AuthCommand = (typeof AUTH_COMMANDS)[number];

// Admin numbers - ganti dengan nomor admin yang sebenarnya
export const ADMIN_NUMBERS = [
  "6282265017034@s.whatsapp.net", // Ganti dengan nomor admin Anda
];

// Reminder links
export const REMINDER_LINKS = {
  pagi: "https://technoapp.berijalan.id/absence/checkin",
  sore: "https://technoapp.berijalan.id/absence/checkout",
} as const;

// Validation constants
export const VALIDATION = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MIN_SUSPEND_MINUTES: 1,
  MAX_SUSPEND_MINUTES: 120,
} as const;

// Reminder schedule (weekdays only: Monday-Friday)
export const SCHEDULE = {
  RESET_ABSEN: "1 0 * * 1-5", // Reset jam 00:01 (tengah malam) - Senin sampai Jumat
  REMINDER_PAGI: "0 8 * * 1-5", // Reminder pagi jam 08:00 - Senin sampai Jumat
  REMINDER_SORE: "0 17 * * 1-5", // Reminder sore jam 17:00 - Senin sampai Jumat
  REMINDER_INTERVAL: "*/5 * * * 1-5", // Reminder ulang setiap 5 menit - Senin sampai Jumat
} as const;

// Timezone
export const TIMEZONE = "Asia/Jakarta";
export const LOCALE = "id-ID";

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
export const AUTH_COMMANDS = [
  "sudah",
  "status",
  "stats",
  "suspend",
  "izin",
  "sakit",
  "cuti",
] as const;
export type AuthCommand = (typeof AUTH_COMMANDS)[number];

// Status types for user leave/absence
export const STATUS_TYPES = ["izin", "sakit", "cuti"] as const;
export type StatusType = (typeof STATUS_TYPES)[number];

// Status type labels for display
export const STATUS_LABELS = {
  izin: "Izin",
  sakit: "Sakit",
  cuti: "Cuti",
  aktif: "Aktif",
} as const;

// Admin numbers
export const ADMIN_NUMBERS = [
  "6282265017034@s.whatsapp.net",
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
  MIN_STATUS_DAYS: 1,
  MAX_STATUS_DAYS: 30,
  MIN_REASON_LENGTH: 5,
  MAX_REASON_LENGTH: 200,
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

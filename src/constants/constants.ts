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
export const ADMIN_NUMBERS = ["085157803374@s.whatsapp.net"];

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

// Reminder schedule
export const SCHEDULE = {
  REMINDER_INTERVAL: "*/5 0,8-23 * * 1-5",
} as const;

// Timezone
export const TIMEZONE = "Asia/Jakarta";
export const LOCALE = "id-ID";

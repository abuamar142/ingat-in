import type { WASocket, proto } from "@whiskeysockets/baileys";

export interface User {
  number: string;
  name?: string;
  absen_pagi: boolean;
  absen_sore: boolean;
  last_checkin: string | null;
  suspend_until?: string | null;
}

export type ReminderType = "pagi" | "sore";

export type WAMessage = proto.IWebMessageInfo;

export type BotSocket = WASocket;

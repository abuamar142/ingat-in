import type { WASocket, proto } from "@whiskeysockets/baileys";

export interface User {
  number: string;
  absen_pagi: boolean;
  absen_sore: boolean;
  last_checkin: string | null;
}

export type ReminderType = "pagi" | "sore";

export type WAMessage = proto.IWebMessageInfo;

export type BotSocket = WASocket;

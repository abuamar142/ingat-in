import { isUserExists } from "../utils/db.js";
import type { BotSocket, WAMessage } from "../types/index.js";
import { handleGreeting, handleMenu } from "./commands/public.js";
import { handleCheckin, handleStatus, handleStats, handleSuspend } from "./commands/auth.js";
import {
  startRegistration,
  handleRegistrationInput,
  isInRegistration,
} from "./commands/registration.js";
import { handleAdminCommand } from "./commands/admin.js";
import {
  handleStatusRequest,
  handleStatusReasonInput,
  isInStatusInput,
} from "./commands/status.js";
import { PUBLIC_COMMANDS, AUTH_COMMANDS, type PublicCommand } from "../constants/constants.js";

function isPublicCommand(text: string): text is PublicCommand {
  return PUBLIC_COMMANDS.includes(text as PublicCommand);
}

function isAuthCommand(text: string): boolean {
  // Check exact match atau command dengan parameter (contoh: "suspend 30")
  return AUTH_COMMANDS.some((cmd) => text === cmd || text.startsWith(`${cmd} `));
}

export async function handleIncoming(sock: BotSocket, msg: WAMessage): Promise<void> {
  const from = msg.key.remoteJid;
  const rawText = msg.message?.conversation;

  if (!from || !rawText) return;

  const text = rawText.trim().toLowerCase();

  // Priority 0: Handle admin commands first
  const isAdminHandled = await handleAdminCommand(sock, from, text);
  if (isAdminHandled) {
    return;
  }

  // Priority 1: Handle registrasi yang sedang berjalan
  if (isInRegistration(from)) {
    await handleRegistrationInput(sock, from, rawText.trim());
    return;
  }

  // Priority 1.5: Handle status input (izin/sakit/cuti reason)
  const user = await isUserExists(from);
  if (user && isInStatusInput(from)) {
    await handleStatusReasonInput(sock, from, user, rawText.trim());
    return;
  }

  // Priority 2: Handle public commands
  if (isPublicCommand(text)) {
    await handlePublicCommand(sock, from, text);
    return;
  }

  // Priority 3: Handle auth commands (perlu cek user exists)
  if (isAuthCommand(text)) {
    await handleAuthCommand(sock, from, text);
    return;
  }

  // Default: Unknown command
  await sock.sendMessage(from, {
    text: "❓ Command tidak dikenali. Ketik 'menu' atau 'help' untuk melihat daftar command.",
  });
}

async function handlePublicCommand(
  sock: BotSocket,
  from: string,
  command: PublicCommand
): Promise<void> {
  switch (command) {
    case "halo":
    case "hi":
    case "hello":
      await handleGreeting(sock, from);
      break;

    case "daftar":
      await startRegistration(sock, from);
      break;

    case "menu":
    case "help":
      await handleMenu(sock, from);
      break;
  }
}

async function handleAuthCommand(sock: BotSocket, from: string, text: string): Promise<void> {
  // Cek apakah user sudah terdaftar
  const user = await isUserExists(from);

  if (!user) {
    await sock.sendMessage(from, {
      text: "⚠️ Kamu belum terdaftar. Ketik 'daftar' untuk mendaftar terlebih dahulu.",
    });
    return;
  }

  // Cek apakah user sudah melengkapi nama
  if (!user.name) {
    await sock.sendMessage(from, {
      text: "⚠️ Registrasi kamu belum lengkap. Silakan masukkan nama kamu terlebih dahulu:",
    });
    return;
  }

  // Handle command berdasarkan jenis
  if (text === "sudah") {
    await handleCheckin(sock, from, user);
  } else if (text === "status") {
    await handleStatus(sock, from, user);
  } else if (text === "stats") {
    await handleStats(sock, from);
  } else if (text.startsWith("suspend ")) {
    const minutesStr = text.replace("suspend ", "").trim();
    const minutes = parseInt(minutesStr, 10);
    await handleSuspend(sock, from, user, minutes);
  } else if (text.startsWith("izin")) {
    const daysStr = text.replace("izin", "").trim();
    await handleStatusRequest(sock, from, user, "izin", daysStr || "1");
  } else if (text.startsWith("sakit")) {
    const daysStr = text.replace("sakit", "").trim();
    await handleStatusRequest(sock, from, user, "sakit", daysStr || "1");
  } else if (text.startsWith("cuti")) {
    const daysStr = text.replace("cuti", "").trim();
    await handleStatusRequest(sock, from, user, "cuti", daysStr || "1");
  }
}

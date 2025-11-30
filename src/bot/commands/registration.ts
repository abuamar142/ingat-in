import { addUser, isUserExists, updateUser } from "../../utils/db.js";
import type { BotSocket } from "../../types/index.js";
import { VALIDATION } from "../../constants/constants.js";

// Store untuk menyimpan state registrasi sementara
const registrationState = new Map<string, { step: "waiting_name" }>();

export async function startRegistration(sock: BotSocket, from: string): Promise<boolean> {
  const existingUser = await isUserExists(from);

  if (existingUser) {
    if (existingUser.name) {
      await sock.sendMessage(from, {
        text: "ℹ️ Kamu sudah terdaftar! Ketik 'menu' untuk melihat command yang tersedia.",
      });
    } else {
      // User exists tapi belum isi nama
      registrationState.set(from, { step: "waiting_name" });
      await sock.sendMessage(from, {
        text: "📝 Silakan masukkan nama kamu untuk melengkapi registrasi:",
      });
    }
    return false;
  }

  // User baru, tambahkan ke database tapi tandai belum lengkap
  await addUser(from);
  registrationState.set(from, { step: "waiting_name" });

  await sock.sendMessage(from, {
    text: "🎉 Selamat datang! Untuk melanjutkan, silakan masukkan nama kamu:",
  });

  return true;
}

export async function handleRegistrationInput(
  sock: BotSocket,
  from: string,
  text: string
): Promise<boolean> {
  const state = registrationState.get(from);

  if (!state) {
    return false;
  }

  if (state.step === "waiting_name") {
    // Validasi nama
    const name = text.trim();

    if (name.length < VALIDATION.MIN_NAME_LENGTH) {
      await sock.sendMessage(from, {
        text: `⚠️ Nama terlalu pendek. Silakan masukkan nama yang valid (minimal ${VALIDATION.MIN_NAME_LENGTH} karakter):`,
      });
      return true;
    }

    if (name.length > VALIDATION.MAX_NAME_LENGTH) {
      await sock.sendMessage(from, {
        text: `⚠️ Nama terlalu panjang. Silakan masukkan nama yang lebih pendek (maksimal ${VALIDATION.MAX_NAME_LENGTH} karakter):`,
      });
      return true;
    }

    // Update user dengan nama
    await updateUser(from, { name });
    registrationState.delete(from);

    await sock.sendMessage(from, {
      text: `✅ Registrasi berhasil! Selamat datang, ${name}!\n\nKamu akan menerima reminder absen pada:\n• Pagi: 08:00 WIB\n• Sore: 17:00 WIB\n\nKetik 'menu' untuk melihat command yang tersedia.`,
    });

    return true;
  }

  return false;
}

export function isInRegistration(from: string): boolean {
  return registrationState.has(from);
}

export function clearRegistrationState(from: string): void {
  registrationState.delete(from);
}

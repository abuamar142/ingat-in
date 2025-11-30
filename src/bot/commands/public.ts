import type { BotSocket } from "../../types/index.js";

export async function handleGreeting(sock: BotSocket, from: string): Promise<void> {
  await sock.sendMessage(from, {
    text: "Halo! Selamat datang di Ingat-In Bot. Ketik 'daftar' untuk mendaftar dan mulai menerima reminder absen.",
  });
}

export async function handleMenu(sock: BotSocket, from: string): Promise<void> {
  await sock.sendMessage(from, {
    text: `📋 *Menu Ingat-In Bot*

*Public Commands:*
• halo/hi/hello - Sambutan
• daftar - Mulai proses pendaftaran
• menu/help - Lihat menu ini

*User Commands (setelah terdaftar):*
• sudah - Konfirmasi sudah absen
• status - Cek status absen kamu
• suspend [menit] - Tunda reminder (contoh: suspend 30)
• stats - Lihat statistik keseluruhan

*Admin Commands:*
• admin help - Lihat menu admin`,
  });
}

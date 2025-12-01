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

*Status Commands:*
• izin [hari] - Ajukan izin (contoh: izin 2)
• sakit [hari] - Lapor sakit (contoh: sakit 1)
• cuti [hari] - Ajukan cuti (contoh: cuti 3)

*Admin Commands:*
• admin help - Lihat menu admin`,
  });
}

import { addUser, updateUser } from "../utils/db.js";

export async function handleIncoming(sock, msg) {
  const from = msg.key.remoteJid;
  const text = msg.message?.conversation?.toLowerCase();

  if (!text) return;

  // Simpan user baru
  addUser(from);

  if (text === "halo") {
    await sock.sendMessage(from, { text: "Halo! Kamu sudah terdaftar untuk reminder absen." });
  }

  // User bilang SUDAH → checklist absen
  if (text.includes("sudah")) {
    updateUser(from, {
      absen_pagi: true,
      absen_sore: true, // contoh: bisa dipisah sesuai jam
      last_checkin: new Date().toISOString(),
    });

    await sock.sendMessage(from, { text: "Terima kasih! Absen kamu sudah dicatat." });
  }

  if (text === "menu") {
    await sock.sendMessage(from, {
      text: `Menu:
1. halo
2. sudah (untuk checklist absen)`,
    });
  }
}

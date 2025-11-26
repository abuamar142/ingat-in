import { addUser, updateUser, loadUsers } from "../utils/db.js";
import { resetAbsenPagi, resetAbsenSore, resetAllAbsen } from "../scheduler/reset.js";
import { broadcastUpdate } from "../web/server.js";
import type { BotSocket, WAMessage } from "../types/index.js";

export async function handleIncoming(
  sock: BotSocket,
  msg: WAMessage
): Promise<void> {
  const from = msg.key.remoteJid;
  const text = msg.message?.conversation?.toLowerCase();

  if (!from || !text) return;

  // Simpan user baru
  addUser(from);
  broadcastUpdate(); // Broadcast ke dashboard

  if (text === "halo") {
    await sock.sendMessage(from, {
      text: "Halo! Kamu sudah terdaftar untuk reminder absen.",
    });
  }

  // User bilang SUDAH → checklist absen berdasarkan waktu
  if (text.includes("sudah")) {
    const hour = new Date().getHours();
    const update: any = { last_checkin: new Date().toISOString() };

    // Pagi (06:00 - 11:59)
    if (hour >= 6 && hour < 12) {
      update.absen_pagi = true;
    }
    // Sore (12:00 - 23:59)
    else if (hour >= 12) {
      update.absen_sore = true;
    }
    // Malam/dini hari - set keduanya
    else {
      update.absen_pagi = true;
      update.absen_sore = true;
    }

    updateUser(from, update);
    broadcastUpdate(); // Broadcast ke dashboard

    const waktu = hour >= 6 && hour < 12 ? "pagi" : hour >= 12 ? "sore" : "";
    await sock.sendMessage(from, {
      text: `✅ Terima kasih! Absen ${waktu} kamu sudah dicatat.`,
    });
  }

  if (text === "menu" || text === "help") {
    await sock.sendMessage(from, {
      text: `📋 *Menu Ingat-In Bot*

*User Commands:*
• halo - Daftar untuk reminder
• sudah - Konfirmasi sudah absen
• status - Cek status absen kamu
• menu/help - Lihat menu ini

*Admin Commands:*
• reset pagi - Reset absen pagi
• reset sore - Reset absen sore
• reset all - Reset semua absen
• stats - Lihat statistik`,
    });
  }

  if (text === "status") {
    const users = loadUsers();
    const user = users.find((u) => u.number === from);

    if (user) {
      const pagiStatus = user.absen_pagi ? "✅ Sudah" : "❌ Belum";
      const soreStatus = user.absen_sore ? "✅ Sudah" : "❌ Belum";
      const lastCheckin = user.last_checkin
        ? new Date(user.last_checkin).toLocaleString("id-ID")
        : "Belum pernah";

      await sock.sendMessage(from, {
        text: `📊 *Status Absen Kamu*

Absen Pagi: ${pagiStatus}
Absen Sore: ${soreStatus}
Last Check-in: ${lastCheckin}`,
      });
    }
  }

  // Admin commands
  if (text === "reset pagi") {
    resetAbsenPagi();
    broadcastUpdate(); // Broadcast ke dashboard
    await sock.sendMessage(from, {
      text: "🔄 Absen pagi berhasil direset untuk semua user.",
    });
  }

  if (text === "reset sore") {
    resetAbsenSore();
    broadcastUpdate(); // Broadcast ke dashboard
    await sock.sendMessage(from, {
      text: "🔄 Absen sore berhasil direset untuk semua user.",
    });
  }

  if (text === "reset all") {
    resetAllAbsen();
    broadcastUpdate(); // Broadcast ke dashboard
    await sock.sendMessage(from, {
      text: "🔄 Semua absen berhasil direset untuk semua user.",
    });
  }

  if (text === "stats") {
    const users = loadUsers();
    const totalUsers = users.length;
    const absenPagiCount = users.filter((u) => u.absen_pagi).length;
    const absenSoreCount = users.filter((u) => u.absen_sore).length;

    await sock.sendMessage(from, {
      text: `📊 *Statistik Absensi*

Total Users: ${totalUsers}
Absen Pagi: ${absenPagiCount}/${totalUsers}
Absen Sore: ${absenSoreCount}/${totalUsers}
Dashboard: http://localhost:3000`,
    });
  }
}

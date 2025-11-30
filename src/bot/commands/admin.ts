import { loadUsers, resetAllUsers } from "../../utils/db.js";
import { sendReminder } from "../../scheduler/reminder.js";
import type { BotSocket } from "../../types/index.js";
import { ADMIN_NUMBERS } from "../../constants/constants.js";

function isAdmin(number: string): boolean {
  return ADMIN_NUMBERS.includes(number);
}

export async function handleAdminCommand(
  sock: BotSocket,
  from: string,
  text: string
): Promise<boolean> {
  // Check if user is admin
  console.log(`🔑 Memeriksa admin untuk nomor: ${from}`);
  console.log(`${from} adalah admin: ${isAdmin(from)}`);
  if (!isAdmin(from)) {
    return false;
  }

  // Reset commands
  if (text === "reset pagi") {
    const users = await loadUsers();
    for (const user of users) {
      await sock.sendMessage(user.number, {
        text: "🔄 Admin telah mereset absen pagi. Status absen pagi kamu sekarang: Belum absen.",
      });
    }
    await resetAllUsers();
    await sock.sendMessage(from, {
      text: "✅ Reset absen pagi berhasil untuk semua user.",
    });
    return true;
  }

  if (text === "reset sore") {
    const users = await loadUsers();
    for (const user of users) {
      await sock.sendMessage(user.number, {
        text: "🔄 Admin telah mereset absen sore. Status absen sore kamu sekarang: Belum absen.",
      });
    }
    await resetAllUsers();
    await sock.sendMessage(from, {
      text: "✅ Reset absen sore berhasil untuk semua user.",
    });
    return true;
  }

  if (text === "reset all") {
    await resetAllUsers();
    await sock.sendMessage(from, {
      text: "✅ Reset semua absen berhasil untuk semua user.",
    });
    return true;
  }

  // Manual trigger reminder
  if (text === "send pagi") {
    await sock.sendMessage(from, {
      text: "📤 Mengirim reminder pagi ke semua user...",
    });
    await sendReminder(sock, "pagi");
    await sock.sendMessage(from, {
      text: "✅ Reminder pagi berhasil dikirim!",
    });
    return true;
  }

  if (text === "send sore") {
    await sock.sendMessage(from, {
      text: "📤 Mengirim reminder sore ke semua user...",
    });
    await sendReminder(sock, "sore");
    await sock.sendMessage(from, {
      text: "✅ Reminder sore berhasil dikirim!",
    });
    return true;
  }

  // List all users
  if (text === "list users") {
    const users = await loadUsers();
    let message = `📋 *Daftar Semua User* (${users.length} user)\n\n`;

    users.forEach((user, index) => {
      const pagi = user.absen_pagi ? "✅" : "❌";
      const sore = user.absen_sore ? "✅" : "❌";
      const name = user.name || "Belum isi nama";
      const suspended = user.suspend_until
        ? new Date(user.suspend_until) > new Date()
          ? "⏸️"
          : ""
        : "";

      message += `${index + 1}. ${name} ${suspended}\n`;
      message += `   ${user.number}\n`;
      message += `   Pagi: ${pagi} | Sore: ${sore}\n\n`;
    });

    await sock.sendMessage(from, { text: message });
    return true;
  }

  // Admin help menu
  if (text === "admin help" || text === "admin menu") {
    await sock.sendMessage(from, {
      text: `🔧 *Admin Commands*

*Reset Commands:*
• reset pagi - Reset absen pagi
• reset sore - Reset absen sore  
• reset all - Reset semua absen

*Manual Reminder:*
• send pagi - Kirim reminder pagi sekarang
• send sore - Kirim reminder sore sekarang

*Info Commands:*
• list users - Lihat semua user & status
• stats - Lihat statistik

*Help:*
• admin help - Menu admin ini`,
    });
    return true;
  }

  return false;
}

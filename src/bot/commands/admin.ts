import { loadUsers, resetAllUsers } from "../../utils/db.js";
import { sendReminder } from "../../scheduler/reminder.js";
import type { BotSocket } from "../../types/index.js";
import { ADMIN_NUMBERS } from "../../constants/constants.js";
import { getActiveLeave, getAllActiveLeaves } from "../../utils/leaves.js";

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

    for (let index = 0; index < users.length; index++) {
      const user = users[index];
      const pagi = user.absen_pagi ? "✅" : "❌";
      const sore = user.absen_sore ? "✅" : "❌";
      const name = user.name || "Belum isi nama";
      const suspended = user.suspend_until
        ? new Date(user.suspend_until) > new Date()
          ? "⏸️"
          : ""
        : "";

      // Check if user on leave
      const activeLeave = await getActiveLeave(user.number);
      const leaveIcon = activeLeave ? "🏥" : "";
      const leaveInfo = activeLeave
        ? `\n   ${activeLeave.type.toUpperCase()} sampai ${new Date(activeLeave.end_date).toLocaleDateString("id-ID")}`
        : "";

      message += `${index + 1}. ${name} ${suspended}${leaveIcon}\n`;
      message += `   ${user.number}\n`;
      message += `   Pagi: ${pagi} | Sore: ${sore}${leaveInfo}\n\n`;
    }

    await sock.sendMessage(from, { text: message });
    return true;
  }

  // List all active leaves
  if (text === "list leaves" || text === "leaves") {
    const activeLeaves = await getAllActiveLeaves();

    if (activeLeaves.length === 0) {
      await sock.sendMessage(from, {
        text: "📋 *Active Leaves*\n\nTidak ada user yang sedang izin/sakit/cuti saat ini.",
      });
      return true;
    }

    let message = `📋 *Active Leaves* (${activeLeaves.length} user)\n\n`;

    for (const leave of activeLeaves) {
      const endDate = new Date(leave.end_date).toLocaleDateString("id-ID");
      message += `🏥 *${leave.type.toUpperCase()}*\n`;
      message += `   User: ${leave.user_number.replace("@s.whatsapp.net", "")}\n`;
      message += `   Durasi: ${leave.days} hari\n`;
      message += `   Sampai: ${endDate}\n`;
      message += `   Alasan: ${leave.reason}\n\n`;
    }

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
• list leaves - Lihat user yang sedang izin/sakit/cuti
• stats - Lihat statistik

*Help:*
• admin help - Menu admin ini`,
    });
    return true;
  }

  return false;
}

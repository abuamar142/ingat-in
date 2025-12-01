import { loadUsers } from "../utils/db.js";
import { delay } from "../utils/delay.js";
import type { BotSocket, User, ReminderType } from "../types/index.js";
import { REMINDER_LINKS, LOCALE } from "../constants/constants.js";
import { isUserOnLeave } from "../bot/commands/status.js";

export async function sendReminder(sock: BotSocket, type: ReminderType = "pagi"): Promise<void> {
  const users = await loadUsers();
  const now = new Date();

  console.log(`📤 Memproses reminder ${type} pada jam ${now.toLocaleTimeString(LOCALE)}`);
  console.log(`👥 Total users: ${users.length}`);

  const link = REMINDER_LINKS[type];

  let batch: User[] = [];
  let skipCount = 0;
  let suspendCount = 0;
  let leaveCount = 0;

  for (const user of users) {
    const status = type === "pagi" ? user.absen_pagi : user.absen_sore;
    if (status) {
      skipCount++;
      continue; // sudah absen
    }

    // Cek apakah user sedang izin/sakit/cuti
    const onLeave = await isUserOnLeave(user);
    if (onLeave) {
      leaveCount++;
      console.log(`🏥 User ${user.number} sedang on leave`);
      continue;
    }

    // Cek apakah user sedang suspend
    if (user.suspend_until) {
      const suspendUntil = new Date(user.suspend_until);
      const now = new Date();

      if (now < suspendUntil) {
        suspendCount++;
        console.log(`⏰ User ${user.number} suspend sampai ${suspendUntil.toLocaleString(LOCALE)}`);
        continue;
      }
    }

    batch.push(user);

    if (batch.length === 5) {
      await sendBatch(sock, batch, link);
      batch = [];
      await delay(3000); // jeda antar batch
    }
  }

  if (batch.length > 0) {
    await sendBatch(sock, batch, link);
  }

  console.log(`✅ Reminder ${type} selesai:`);
  console.log(`   - Terkirim: ${users.length - skipCount - suspendCount - leaveCount} user`);
  console.log(`   - Dilewati (sudah absen): ${skipCount} user`);
  console.log(`   - Ditunda (suspend): ${suspendCount} user`);
  console.log(`   - Sedang izin/sakit/cuti: ${leaveCount} user\n`);
}

async function sendBatch(sock: BotSocket, batch: User[], link: string): Promise<void> {
  for (const u of batch) {
    try {
      await sock.sendMessage(u.number, {
        text: `Reminder absen ${link}\nKetik *sudah* jika sudah absen.`,
      });
      console.log(`   ✓ Terkirim ke ${u.number}`);
      await delay(1200); // delay aman
    } catch (error) {
      console.error(
        `   ✗ Gagal kirim ke ${u.number}:`,
        error instanceof Error ? error.message : error
      );
    }
  }
}

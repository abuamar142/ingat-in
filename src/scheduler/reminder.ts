import { loadUsers } from "../utils/db.js";
import { delay } from "../utils/delay.js";
import type { BotSocket, User, ReminderType } from "../types/index.js";

export async function sendReminder(
  sock: BotSocket,
  type: ReminderType = "pagi",
): Promise<void> {
  const users = await loadUsers();

  console.log(`📤 Memproses reminder ${type}...`);
  console.log(`👥 Total users: ${users.length}`);

  const link =
    type === "pagi"
      ? "https://technoapp.berijalan.id/absence/checkin"
      : "https://technoapp.berijalan.id/absence/checkout";

  let batch: User[] = [];
  let skipCount = 0;

  for (const user of users) {
    const status = type === "pagi" ? user.absen_pagi : user.absen_sore;
    if (status) {
      skipCount++;
      continue; // sudah absen
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
  console.log(`   - Terkirim: ${users.length - skipCount} user`);
  console.log(`   - Dilewati (sudah absen): ${skipCount} user\n`);
}

async function sendBatch(
  sock: BotSocket,
  batch: User[],
  link: string,
): Promise<void> {
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
        error instanceof Error ? error.message : error,
      );
    }
  }
}

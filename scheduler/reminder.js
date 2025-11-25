import { loadUsers, updateUser } from "../utils/db.js";
import { delay } from "../utils/delay.js";

export async function sendReminder(sock, type = "pagi") {
  const users = loadUsers();

  const link =
    type === "pagi" ? "https://link-absen-mu.com/pagi" : "https://link-absen-mu.com/sore";

  let batch = [];

  for (const user of users) {
    const status = type === "pagi" ? user.absen_pagi : user.absen_sore;
    if (status) continue; // sudah absen

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
}

async function sendBatch(sock, batch, link) {
  for (const u of batch) {
    await sock.sendMessage(u.number, {
      text: `Reminder absen ${link}\nKetik *sudah* jika sudah absen.`,
    });
    await delay(1200); // delay aman
  }
}

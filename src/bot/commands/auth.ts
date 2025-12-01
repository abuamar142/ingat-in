import { updateUser, loadUsers } from "../../utils/db.js";
import type { BotSocket, User } from "../../types/index.js";
import { VALIDATION, LOCALE } from "../../constants/constants.js";
import { getStatusInfo } from "./status.js";

export async function handleCheckin(sock: BotSocket, from: string, _user: User): Promise<void> {
  const now = new Date();
  const hour = now.getHours();
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

  if (update.suspend_until > now.toISOString()) {
    update.suspend_until = null;
  }

  await updateUser(from, update);

  const waktu = hour >= 6 && hour < 12 ? "pagi" : hour >= 12 ? "sore" : "";
  await sock.sendMessage(from, {
    text: `✅ Terima kasih! Absen ${waktu} kamu sudah dicatat.`,
  });
}

export async function handleStatus(sock: BotSocket, from: string, user: User): Promise<void> {
  const pagiStatus = user.absen_pagi ? "✅ Sudah" : "❌ Belum";
  const soreStatus = user.absen_sore ? "✅ Sudah" : "❌ Belum";
  const lastCheckin = user.last_checkin
    ? new Date(user.last_checkin).toLocaleString(LOCALE)
    : "Belum pernah";

  const suspendText = user.suspend_until
    ? `\nReminder ditunda sampai: ${new Date(user.suspend_until).toLocaleString(LOCALE)}`
    : "";

  const statusInfo = await getStatusInfo(user);

  await sock.sendMessage(from, {
    text: `📊 *Status Absen Kamu*

Nama: ${user.name || "Belum diisi"}
${statusInfo}
Absen Pagi: ${pagiStatus}
Absen Sore: ${soreStatus}
Last Check-in: ${lastCheckin}${suspendText}`,
  });
}

export async function handleStats(sock: BotSocket, from: string): Promise<void> {
  const users = await loadUsers();
  const totalUsers = users.length;
  const absenPagiCount = users.filter((u) => u.absen_pagi).length;
  const absenSoreCount = users.filter((u) => u.absen_sore).length;

  await sock.sendMessage(from, {
    text: `📊 *Statistik Absensi*

Total Users: ${totalUsers}
Absen Pagi: ${absenPagiCount}/${totalUsers}
Absen Sore: ${absenSoreCount}/${totalUsers}
Dashboard: http://ingatin.abuamar.site`,
  });
}

export async function handleSuspend(
  sock: BotSocket,
  from: string,
  _user: User,
  minutes: number
): Promise<void> {
  if (
    isNaN(minutes) ||
    minutes < VALIDATION.MIN_SUSPEND_MINUTES ||
    minutes > VALIDATION.MAX_SUSPEND_MINUTES
  ) {
    await sock.sendMessage(from, {
      text: `⚠️ Masukkan waktu yang valid (${VALIDATION.MIN_SUSPEND_MINUTES}-${VALIDATION.MAX_SUSPEND_MINUTES} menit). Contoh: suspend 30`,
    });
    return;
  }

  const suspendUntil = new Date(Date.now() + minutes * 60 * 1000);
  await updateUser(from, {
    suspend_until: suspendUntil.toISOString(),
  });

  await sock.sendMessage(from, {
    text: `⏰ Reminder kamu ditunda selama ${minutes} menit.\nAkan aktif kembali pada: ${suspendUntil.toLocaleString(LOCALE)}`,
  });
}

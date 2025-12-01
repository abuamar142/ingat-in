import type { BotSocket, User } from "../../types/index.js";
import { VALIDATION, STATUS_LABELS, LOCALE, ADMIN_NUMBERS } from "../../constants/constants.js";
import { createLeaveRequest, getActiveLeave } from "../../utils/leaves.js";

type LeaveType = "izin" | "sakit" | "cuti";

// Store untuk menyimpan state status request sementara
interface StatusState {
  type: LeaveType;
  days: number;
  step: "waiting_reason";
}

const statusState = new Map<string, StatusState>();

/**
 * Handle status command (izin, sakit, cuti)
 */
export async function handleStatusRequest(
  sock: BotSocket,
  from: string,
  _user: User,
  statusType: "izin" | "sakit" | "cuti",
  daysStr?: string
): Promise<void> {
  // Parse jumlah hari, default 1
  const days = daysStr ? parseInt(daysStr, 10) : 1;

  // Validasi jumlah hari
  if (isNaN(days) || days < VALIDATION.MIN_STATUS_DAYS || days > VALIDATION.MAX_STATUS_DAYS) {
    await sock.sendMessage(from, {
      text: `⚠️ Jumlah hari tidak valid. Minimal ${VALIDATION.MIN_STATUS_DAYS} hari, maksimal ${VALIDATION.MAX_STATUS_DAYS} hari.\n\nContoh: ${statusType} 3`,
    });
    return;
  }

  // Simpan state untuk menunggu alasan
  statusState.set(from, {
    type: statusType,
    days,
    step: "waiting_reason",
  });

  await sock.sendMessage(from, {
    text: `📝 *${STATUS_LABELS[statusType]}* selama *${days} hari*\n\nSilakan masukkan alasan/keterangan (minimal ${VALIDATION.MIN_REASON_LENGTH} karakter):`,
  });
}

/**
 * Handle input alasan dari user
 */
export async function handleStatusReasonInput(
  sock: BotSocket,
  from: string,
  user: User,
  reason: string
): Promise<boolean> {
  const state = statusState.get(from);

  if (!state) {
    return false;
  }

  // Validasi alasan
  const trimmedReason = reason.trim();

  if (trimmedReason.length < VALIDATION.MIN_REASON_LENGTH) {
    await sock.sendMessage(from, {
      text: `⚠️ Alasan terlalu pendek. Minimal ${VALIDATION.MIN_REASON_LENGTH} karakter. Silakan masukkan alasan yang lebih detail:`,
    });
    return true;
  }

  if (trimmedReason.length > VALIDATION.MAX_REASON_LENGTH) {
    await sock.sendMessage(from, {
      text: `⚠️ Alasan terlalu panjang. Maksimal ${VALIDATION.MAX_REASON_LENGTH} karakter. Silakan persingkat:`,
    });
    return true;
  }

  // Hitung start_date (besok) dan end_date
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + state.days - 1);

  // Create leave request in database
  const leave = await createLeaveRequest({
    user_number: from,
    type: state.type as "izin" | "sakit" | "cuti",
    reason: trimmedReason,
    start_date: startDate.toISOString().split("T")[0],
    end_date: endDate.toISOString().split("T")[0],
    days: state.days,
    status: "active",
  });

  if (!leave) {
    await sock.sendMessage(from, {
      text: "❌ Gagal menyimpan data. Silakan coba lagi.",
    });
    statusState.delete(from);
    return true;
  }

  // Clear state
  statusState.delete(from);

  // Kirim konfirmasi ke user
  const statusLabel = STATUS_LABELS[state.type];
  await sock.sendMessage(from, {
    text: `✅ *${statusLabel}* kamu telah dicatat!\n\n📅 Durasi: ${state.days} hari\n📝 Alasan: ${trimmedReason}\n⏰ Aktif kembali: ${endDate.toLocaleDateString(LOCALE, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}\n\nReminder akan otomatis aktif kembali setelah periode ${statusLabel.toLowerCase()} selesai.`,
  });

  // Kirim notifikasi ke admin
  await sendAdminNotification(sock, user, state.type, state.days, trimmedReason, endDate);

  return true;
}

/**
 * Kirim notifikasi ke admin
 */
async function sendAdminNotification(
  sock: BotSocket,
  user: User,
  statusType: LeaveType,
  days: number,
  reason: string,
  until: Date
): Promise<void> {
  const statusLabel = STATUS_LABELS[statusType];
  const userName = user.name || "User tanpa nama";
  const message = `🔔 *Notifikasi ${statusLabel}*

👤 *User:* ${userName}
📱 *Nomor:* ${user.number.replace("@s.whatsapp.net", "")}
📊 *Status:* ${statusLabel}
📅 *Durasi:* ${days} hari
📝 *Alasan:* ${reason}
⏰ *Aktif kembali:* ${until.toLocaleDateString(LOCALE, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`;

  // Kirim ke semua admin
  for (const adminNumber of ADMIN_NUMBERS) {
    try {
      await sock.sendMessage(adminNumber, { text: message });
      console.log(`✅ Notifikasi ${statusLabel} terkirim ke admin: ${adminNumber}`);
    } catch (error) {
      console.error(`❌ Gagal kirim notifikasi ke admin ${adminNumber}:`, error);
    }
  }
}

/**
 * Check apakah user sedang dalam proses input status
 */
export function isInStatusInput(from: string): boolean {
  return statusState.has(from);
}

/**
 * Clear status state untuk user
 */
export function clearStatusState(from: string): void {
  statusState.delete(from);
}

/**
 * Check apakah status user masih aktif (izin/sakit/cuti)
 */
export async function isUserOnLeave(user: User): Promise<boolean> {
  const activeLeave = await getActiveLeave(user.number);
  return activeLeave !== null;
}

/**
 * Get status info untuk ditampilkan
 */
export async function getStatusInfo(user: User): Promise<string> {
  const activeLeave = await getActiveLeave(user.number);

  if (!activeLeave) {
    return "Status: Aktif";
  }

  const statusLabel = STATUS_LABELS[activeLeave.type];
  const endDate = new Date(activeLeave.end_date);
  const reason = activeLeave.reason || "Tidak ada keterangan";

  return `Status: ${statusLabel}
Alasan: ${reason}
Aktif kembali: ${endDate.toLocaleDateString(LOCALE, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`;
}

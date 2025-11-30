import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from "@whiskeysockets/baileys";
import { handleIncoming } from "./handler.js";
import qrcode from "qrcode-terminal";
import type { BotSocket } from "../types/index.js";

export async function startBot(): Promise<BotSocket> {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    auth: state,
    version,
    printQRInTerminal: false,
    browser: ["Ingat-In Bot", "Chrome", "110.0.0"],
    defaultQueryTimeoutMs: 60000,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("\n╔════════════════════════════════════════╗");
      console.log("║   SCAN QR CODE UNTUK LOGIN WHATSAPP   ║");
      console.log("╚════════════════════════════════════════╝\n");
      qrcode.generate(qr, { small: true });
      console.log("\n📱 Buka WhatsApp di HP → Linked Devices → Link a Device");
      console.log("⏰ QR Code akan expired dalam 60 detik\n");
    }

    if (connection === "close") {
      const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      console.log("\n⚠️  Koneksi terputus!");
      console.log("Status Code:", statusCode);
      console.log("Alasan:", lastDisconnect?.error?.message);

      if (statusCode === 405) {
        console.log("\n❌ Error 405: WhatsApp memblokir koneksi");
        console.log("💡 Solusi:");
        console.log("   1. Tunggu beberapa menit sebelum mencoba lagi");
        console.log("   2. Gunakan koneksi internet yang berbeda");
        console.log("   3. Pastikan WhatsApp Web tidak sedang dibuka di browser");
        console.log("   4. Hapus folder auth_info dan coba lagi\n");
        return;
      }

      if (shouldReconnect) {
        console.log("🔄 Mencoba reconnect dalam 5 detik...\n");
        setTimeout(() => startBot(), 5000);
      } else {
        console.log("❌ Logged out. Hapus folder auth_info dan jalankan ulang.\n");
      }
    } else if (connection === "open") {
      console.log("\n✅ Bot berhasil terhubung ke WhatsApp!");
      console.log("🤖 Bot siap menerima pesan\n");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;
    handleIncoming(sock, msg);
  });

  return sock;
}

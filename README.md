# Ingat-In - WhatsApp Bot Reminder

Bot WhatsApp untuk reminder absen pagi dan sore otomatis.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Jalankan bot
node index.js

# Scan QR code yang muncul di terminal dengan WhatsApp
```

## 💬 Perintah Bot

- `halo` - Daftar untuk reminder
- `sudah` - Konfirmasi sudah absen
- `menu` - Lihat perintah

## ⚙️ Jadwal Reminder

- **Pagi**: 06:00
- **Sore**: 16:00
- **Ulang**: Setiap 5 menit

Edit jadwal di `scheduler/cron.js`

## 🔧 Troubleshooting

### Error 405

```bash
# Hapus session dan coba lagi
rm -rf auth_info
node index.js
```

Atau:

- Tunggu beberapa menit
- Ganti koneksi internet
- Tutup WhatsApp Web di browser

### Bot tidak respon

- Pastikan ada pesan "✅ Bot berhasil terhubung"
- Restart bot (Ctrl+C lalu `node index.js`)

## 📁 File Penting

- `data/users.json` - Data user terdaftar
- `auth_info/` - Session WhatsApp
- `scheduler/cron.js` - Atur jadwal reminder

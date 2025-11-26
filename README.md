# Ingat-In Bot

Bot WhatsApp untuk reminder absen otomatis dengan web dashboard.

## Quick Start

```bash
npm install
npm run dev
```

Scan QR code di terminal dengan WhatsApp.

**Dashboard:** Buka http://localhost:3000

## Commands

- `npm run dev` - Development mode
- `npm run build` - Compile TypeScript
- `npm start` - Production mode

## Dashboard

Web dashboard menampilkan:
- Total users terdaftar
- Statistik absen pagi/sore
- Daftar lengkap users dan status absen
- Auto-refresh setiap 30 detik

**Endpoints:**
- `GET /` - Dashboard UI
- `GET /api/users` - Data semua users
- `GET /api/stats` - Statistik absensi

## Bot Commands

- `halo` - Daftar reminder
- `sudah` - Konfirmasi absen
- `menu` - Lihat command

## Konfigurasi

**Jadwal Reminder** → `src/scheduler/cron.ts`

```typescript
cron.schedule("0 6 * * *", () => sendReminder(sock, "pagi"));
```

**Link Absen** → `src/scheduler/reminder.ts`

**Port Dashboard** → Environment variable `PORT` (default: 3000)

## Reset Session

```bash
rm -rf auth_info/
```

# Ingat-In Bot

Bot WhatsApp untuk reminder absen otomatis dengan web dashboard.

## Quick Start

### Local Development

```bash
npm install
npm run dev
```

### Docker (Recommended for Production)

```bash
# Using script
./docker-start.sh

# Or using Makefile
make up

# View logs (for QR code)
make logs
```

See [DOCKER.md](DOCKER.md) for complete Docker guide.

Scan QR code di terminal dengan WhatsApp.

**Dashboard:** Buka http://localhost:3000

## Commands

- `npm run dev` - Development mode
- `npm run build` - Compile TypeScript
- `npm start` - Production mode

### Docker Commands

- `make up` - Start bot
- `make logs` - View logs
- `make down` - Stop bot
- `make backup` - Backup data
- `make help` - Show all commands

See [DOCKER.md](DOCKER.md) for more details.

## Dashboard

Web dashboard dengan **real-time updates** menggunakan WebSocket:

**Fitur:**

- 🎨 Modern UI dengan Tailwind CSS
- 🔄 Real-time auto-update via WebSocket
- 📊 Live statistics (total users, absen pagi/sore)
- 👥 Daftar lengkap users dengan status absen
- 📈 Progress bar visual untuk persentase absen
- 🟢 Live status indicator
- ⏰ Timestamp last update
- 📱 Responsive design untuk mobile

**Endpoints:**

- `GET /` - Dashboard UI
- `GET /api/users` - Data semua users
- `GET /api/stats` - Statistik absensi
- `WebSocket` - Real-time updates

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

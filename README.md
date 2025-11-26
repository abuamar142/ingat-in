# Ingat-In Bot

Bot WhatsApp untuk reminder absen otomatis.

## Quick Start

```bash
npm install
npm run dev
```

Scan QR code di terminal dengan WhatsApp.

## Commands

- `npm run dev` - Development mode
- `npm run build` - Compile TypeScript
- `npm start` - Production mode

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

## Reset Session

```bash
rm -rf auth_info/
```

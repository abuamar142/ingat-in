# 🐳 Docker Deployment Guide

## Quick Start

### Using Shell Scripts (Easiest)

```bash
# Start bot
./docker-start.sh

# View logs (to see QR code on first run)
./docker-logs.sh

# Stop bot
./docker-stop.sh
```

### Using Makefile (Recommended)

```bash
# Show all available commands
make help

# Start production mode
make up

# View logs
make logs

# Restart bot
make restart

# Stop bot
make down

# Development mode (with hot reload)
make dev

# Backup auth_info and data
make backup

# Restore from backup
make restore

# Clean everything
make clean
```

### Using Docker Compose Directly

```bash
# Production mode
docker-compose up -d

# Development mode
docker-compose -f docker-compose.dev.yml up

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Restart
docker-compose restart
```

## First Time Setup

1. **Start the container:**

   ```bash
   make up
   # or
   ./docker-start.sh
   ```

2. **View logs to see QR code:**

   ```bash
   make logs
   # or
   ./docker-logs.sh
   ```

3. **Scan QR code** with WhatsApp

4. **Bot is connected!** Your session is saved in `auth_info/`

5. **Access dashboard:** http://localhost:3000

## Common Commands

```bash
# View logs
make logs

# Restart after changes
make restart

# Backup before making changes
make backup

# Check if bot is running
docker ps

# Check bot health
curl http://localhost:3000/api/stats
```

## Troubleshooting

### Port already in use

```bash
# Change port in docker-compose.yml
ports:
  - "3001:3000"  # Use port 3001 instead
```

### Bot disconnected

```bash
# Restore from backup
make restore

# Or restart
make restart
```

### View real-time logs

```bash
docker-compose logs -f ingat-in
```

### Enter container shell

```bash
docker exec -it ingat-in-bot sh
```

## File Structure

```
ingat-in/
├── docker-compose.yml         # Production config
├── docker-compose.dev.yml     # Development config
├── Dockerfile                 # Production image
├── Dockerfile.dev            # Development image
├── .dockerignore             # Files to ignore
├── Makefile                  # Easy commands
├── docker-start.sh           # Start script
├── docker-stop.sh            # Stop script
├── docker-logs.sh            # Logs script
├── auth_info/                # WhatsApp session (persisted)
├── data/                     # User database (persisted)
└── logs/                     # Application logs (persisted)
```

## Production Deployment

### 1. Build for production

```bash
make build
```

### 2. Start in production mode

```bash
make up
```

### 3. Check health

```bash
docker ps
curl http://localhost:3000/api/stats
```

## Development Mode

For local development with hot reload:

```bash
# Start development mode
make dev

# View development logs
make dev-logs

# Stop development mode
make dev-down
```

## Backup & Restore

### Backup

```bash
# Create backup
make backup

# Backups are stored in backups/ folder
ls backups/
```

### Restore

```bash
# Restore from latest backup
make restore
```

## Clean Up

```bash
# Stop and remove containers
make down

# Remove everything including volumes (⚠️ WARNING: Deletes auth_info!)
make clean
```

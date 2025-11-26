#!/bin/bash

cat << "EOF"
╔════════════════════════════════════════════════════════════════╗
║              🐳 INGAT-IN DOCKER QUICK REFERENCE               ║
╚════════════════════════════════════════════════════════════════╝

📦 QUICK START
  ./docker-start.sh              Start bot
  ./docker-logs.sh               View logs (see QR code)
  ./docker-stop.sh               Stop bot

🎯 MAKEFILE COMMANDS (Recommended)
  make help                      Show all commands
  make up                        Start production
  make logs                      View logs
  make down                      Stop bot
  make restart                   Restart bot
  make dev                       Start development mode
  make backup                    Backup auth_info & data
  make restore                   Restore from backup
  make clean                     Clean everything

🐋 DOCKER COMPOSE
  docker-compose up -d           Start (detached)
  docker-compose logs -f         View logs (follow)
  docker-compose down            Stop
  docker-compose restart         Restart
  docker-compose ps              Check status

📊 MONITORING
  docker ps                      List containers
  docker stats ingat-in-bot      Resource usage
  curl localhost:3000/api/stats  Health check

🔍 DEBUGGING
  docker exec -it ingat-in-bot sh     Enter container
  docker-compose logs -f --tail 100   Last 100 lines
  docker inspect ingat-in-bot         Container details

💾 BACKUP & RESTORE
  make backup                    Create backup
  make restore                   Restore latest
  ls backups/                    List backups

🌐 ACCESS
  Dashboard:    http://localhost:3000
  API Users:    http://localhost:3000/api/users
  API Stats:    http://localhost:3000/api/stats

📁 IMPORTANT FOLDERS
  auth_info/    WhatsApp session (backed up)
  data/         User database (backed up)
  logs/         Application logs
  backups/      Backup archives

⚡ FIRST TIME SETUP
  1. make up
  2. make logs
  3. Scan QR code
  4. Done!

📖 Full documentation: DOCKER.md

EOF

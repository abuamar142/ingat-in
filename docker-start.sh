#!/bin/bash

echo "🐳 Starting Ingat-In Bot with Docker..."

# Create necessary directories
mkdir -p auth_info data logs

# Build and start
docker-compose up -d --build

echo ""
echo "✅ Bot is starting..."
echo "📊 Dashboard: http://localhost:3000"
echo ""
echo "To view logs (including QR code for first time setup):"
echo "  docker-compose logs -f"
echo ""
echo "To stop:"
echo "  docker-compose down"
echo ""
echo "To restart:"
echo "  docker-compose restart"

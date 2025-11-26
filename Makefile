.PHONY: help build up down restart logs clean dev

help: ## Show this help
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Build Docker image
	docker-compose build

up: ## Start bot in production mode
	docker-compose up -d
	@echo "✅ Bot started!"
	@echo "📊 Dashboard: http://localhost:3000"

down: ## Stop bot
	docker-compose down

restart: ## Restart bot
	docker-compose restart

logs: ## Show logs (Ctrl+C to exit)
	docker-compose logs -f ingat-in

clean: ## Stop and remove all containers, volumes
	docker-compose down -v
	@echo "⚠️  Warning: This will delete auth_info and data!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		rm -rf auth_info data logs; \
		echo "✅ Cleaned!"; \
	fi

dev: ## Start in development mode with hot reload
	docker-compose -f docker-compose.dev.yml up --build

dev-down: ## Stop development mode
	docker-compose -f docker-compose.dev.yml down

dev-logs: ## Show development logs
	docker-compose -f docker-compose.dev.yml logs -f

backup: ## Backup auth_info and data
	@mkdir -p backups
	@tar -czf backups/backup-$$(date +%Y%m%d-%H%M%S).tar.gz auth_info data
	@echo "✅ Backup created in backups/"

restore: ## Restore from latest backup
	@LATEST=$$(ls -t backups/*.tar.gz 2>/dev/null | head -1); \
	if [ -z "$$LATEST" ]; then \
		echo "❌ No backup found"; \
	else \
		echo "Restoring from $$LATEST"; \
		tar -xzf $$LATEST; \
		echo "✅ Restored!"; \
	fi

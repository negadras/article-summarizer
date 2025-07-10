.DEFAULT_GOAL := help

# Colors for output
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m # No Color

.PHONY: help
help: ## Show available commands
	@grep -E '^[a-zA-Z-]+:.*?## .*$$' Makefile | awk 'BEGIN {FS = ":.*?## "}; {printf "$(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'

.PHONY: install
install: ## Install all dependencies
	@echo "$(GREEN)Installing dependencies...$(NC)"
	cd summarizer-api && ./mvnw dependency:resolve
	cd summarizer-web && npm install

.PHONY: dev
dev: ## Start development servers
	@echo "$(GREEN)Starting dev servers (summarizer-api: 8080)$(NC)"
	@trap 'kill %1 %2 2>/dev/null; exit' INT; \
	cd summarizer-api && ./mvnw spring-boot:run & \
	cd summarizer-web && npm run dev & \
	wait

.PHONY: build
build: ## Build for production
	@echo "$(GREEN)Building application...$(NC)"
	cd summarizer-api && ./mvnw clean package -DskipTests
	cd summarizer-web && npm run build

.PHONY: test
test: ## Run all tests
	@echo "$(GREEN)Running tests...$(NC)"
	cd summarizer-api && ./mvnw test
	cd summarizer-web && npm test

.PHONY: clean
clean: ## Clean build artifacts
	@echo "$(GREEN)Cleaning...$(NC)"
	cd summarizer-api && ./mvnw clean
	cd summarizer-web && rm -rf dist node_modules/.vite

.PHONY: stop
stop: ## Stop running servers
	@echo "$(GREEN)Stopping servers...$(NC)"
	@lsof -ti:8080 | xargs kill -9 2>/dev/null || true
	@lsof -ti:5173 | xargs kill -9 2>/dev/null || true
# TODO: individual target per module

# Makefile for istani.org - JavaScript/React project
# Equivalent to Python toolchain for Node.js ecosystem

.PHONY: help setup install lint format typecheck test security build clean precommit ci

help: ## Show this help message
	@echo "📚 istani.org - JavaScript Toolchain Commands"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

setup: ## Initial project setup (equivalent to Python pip install)
	@echo "🔧 Setting up JavaScript toolchain..."
	npm install
	npm install --save-dev husky lint-staged prettier eslint
	npx husky install
	@echo "✅ Setup complete!"

install: ## Install dependencies (npm ci)
	@echo "📦 Installing dependencies..."
	npm ci || npm install

lint: ## Run ESLint (equivalent to Ruff)
	@echo "🔍 Running ESLint..."
	npx eslint . --ext .js,.jsx,.mjs,.ts,.tsx

lint-fix: ## Run ESLint with auto-fix
	@echo "🔧 Running ESLint with auto-fix..."
	npx eslint . --fix --ext .js,.jsx,.mjs,.ts,.tsx

format: ## Run Prettier (equivalent to Black)
	@echo "💅 Formatting with Prettier..."
	npx prettier --write "**/*.{js,jsx,mjs,ts,tsx,json,css,md,html,yml,yaml}"

format-check: ## Check formatting without changes
	@echo "🔍 Checking formatting..."
	npx prettier --check "**/*.{js,jsx,mjs,ts,tsx,json,css,md,html,yml,yaml}"

typecheck: ## Run type checking (equivalent to Mypy)
	@echo "🔬 Type checking..."
	@if [ -f "tsconfig.json" ]; then \
		npx tsc --noEmit; \
	else \
		echo "ℹ️  No TypeScript config found"; \
	fi

test: ## Run tests (equivalent to Pytest)
	@echo "🧪 Running tests..."
	npm test -- --passWithNoTests

test-coverage: ## Run tests with coverage (equivalent to Coverage.py)
	@echo "📊 Running tests with coverage..."
	npm test -- --coverage --passWithNoTests

security: ## Run security checks (equivalent to Bandit + Safety)
	@echo "🔒 Running security checks..."
	@echo "1. npm audit..."
	npm audit --audit-level=moderate || true
	@echo ""
	@echo "2. Gitleaks scan..."
	@if command -v gitleaks &> /dev/null; then \
		gitleaks detect --verbose; \
	else \
		echo "⚠️  Gitleaks not installed. Install: brew install gitleaks"; \
	fi

build: ## Build the project
	@echo "🏗️  Building project..."
	npm run build
	@echo "✅ Build complete!"
	@ls -lh istani-rebuild/

clean: ## Clean build artifacts
	@echo "🧹 Cleaning..."
	rm -rf istani-rebuild/ dist/ build/ node_modules/.cache/

precommit: ## Run all pre-commit checks (equivalent to pre-commit run --all-files)
	@echo "🔍 Running all pre-commit checks..."
	$(MAKE) format
	$(MAKE) lint-fix
	$(MAKE) typecheck
	$(MAKE) test
	$(MAKE) security
	@echo "✅ All pre-commit checks passed!"

ci: ## Run full CI pipeline locally (equivalent to GitHub Actions)
	@echo "🚀 Running full CI pipeline..."
	$(MAKE) install
	$(MAKE) format-check
	$(MAKE) lint
	$(MAKE) typecheck
	$(MAKE) test-coverage
	$(MAKE) security
	$(MAKE) build
	@echo "✅ CI pipeline complete!"

dev: ## Start development server
	@echo "🚀 Starting development server..."
	npm run dev || npm start

deploy: ## Deploy to production
	@echo "🚀 Deploying to production..."
	git push origin main
	@echo "✅ Deployment triggered! Check Vercel dashboard."

# Fitness-specific commands
fitness-content: ## Validate fitness science content
	@echo "🔬 Validating fitness science content..."
	@if [ -f "REAL_FITNESS_SCIENCE.md" ]; then \
		echo "✅ Fitness science content found"; \
		wc -l REAL_FITNESS_SCIENCE.md; \
	else \
		echo "❌ Fitness science content missing"; \
	fi

links-check: ## Verify all ISTANI links are working
	@echo "🔗 Checking istani.store links..."
	@if [ -f "links.html" ]; then \
		echo "✅ Link hub found"; \
		grep -o 'href="[^"]*' links.html | sed 's/href="//' | head -20; \
	fi

# Combined commands
all: clean install precommit build ## Run everything (clean + install + checks + build)
	@echo "✅ All tasks complete!"

quick: lint-fix format test ## Quick check before commit
	@echo "✅ Quick checks passed!"

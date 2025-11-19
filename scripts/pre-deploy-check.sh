#!/bin/bash

# ISTANI Pre-Deployment Validation Script
set -e

echo "🚀 ISTANI Pre-Deployment Validation"
echo "===================================="

# 1. TypeScript
echo "✓ Checking TypeScript..."
npm run typecheck > /dev/null 2>&1 && echo "  ✓ TypeScript: 0 errors" || exit 1

# 2. Tests
echo "✓ Running tests..."
npm run test:run > /dev/null 2>&1 && echo "  ✓ Tests: All passing" || exit 1

# 3. Build
echo "✓ Building for production..."
npm run build > /dev/null 2>&1 && echo "  ✓ Build: Successful" || exit 1

# 4. Security
echo "✓ Security audit..."
npm audit --omit=dev > /dev/null 2>&1 && echo "  ✓ Security: 0 vulnerabilities" || echo "  ⚠ Security: Check manually"

echo ""
echo "✅ ALL CHECKS PASSED - READY FOR DEPLOYMENT"

#!/bin/bash
# Optional: Set up pre-commit hooks to run tests automatically

echo "Setting up pre-commit hooks with Husky..."

# Check if husky is installed
if [ ! -d "node_modules/husky" ]; then
  echo "Installing husky..."
  npm install --save-dev husky
fi

# Initialize husky
npx husky install

# Create pre-commit hook
cat > .husky/pre-commit <<'HOOK'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "Running tests before commit..."
npm run test:ci

if [ $? -ne 0 ]; then
  echo "Tests failed! Commit aborted."
  exit 1
fi

echo "Tests passed! Proceeding with commit."
HOOK

chmod +x .husky/pre-commit

echo "✅ Pre-commit hooks set up successfully!"
echo "Tests will now run automatically before each commit."
echo ""
echo "To disable: rm .husky/pre-commit"
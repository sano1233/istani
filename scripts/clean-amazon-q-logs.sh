#!/bin/bash

# Clean Amazon Q log files from repository
# This script removes Amazon Q log files that may have been accidentally committed

set -e

echo "🧹 Cleaning Amazon Q log files..."

# Find and remove Amazon Q log files
FOUND_FILES=0

# Remove main log file
if [ -f "Amazon Q Logs.log" ]; then
  echo "  Removing: Amazon Q Logs.log"
  rm -f "Amazon Q Logs.log"
  FOUND_FILES=$((FOUND_FILES + 1))
fi

# Remove .q.log files
Q_LOG_FILES=$(find . -name "*.q.log" -type f 2>/dev/null | grep -v node_modules | grep -v .git || true)
if [ -n "$Q_LOG_FILES" ]; then
  echo "$Q_LOG_FILES" | while read -r file; do
    echo "  Removing: $file"
    rm -f "$file"
    FOUND_FILES=$((FOUND_FILES + 1))
  done
fi

# Remove log directories
if [ -d ".q-logs" ]; then
  echo "  Removing directory: .q-logs"
  rm -rf ".q-logs"
  FOUND_FILES=$((FOUND_FILES + 1))
fi

if [ -d "amazon-q-logs" ]; then
  echo "  Removing directory: amazon-q-logs"
  rm -rf "amazon-q-logs"
  FOUND_FILES=$((FOUND_FILES + 1))
fi

if [ $FOUND_FILES -eq 0 ]; then
  echo "✅ No Amazon Q log files found"
else
  echo "✅ Cleaned $FOUND_FILES Amazon Q log file(s)/directory(ies)"
fi

echo ""
echo "💡 Tip: Amazon Q log files are now excluded in .gitignore"
echo "   They will not be tracked by Git in the future"


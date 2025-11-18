#!/bin/bash

# Clear Amazon Q logs (Bash)
# Removes all Amazon Q log files

set -e

echo "🧹 Clearing Amazon Q logs..."

CLEARED_COUNT=0

# Remove main log file
if [ -f "Amazon Q Logs.log" ]; then
    echo "  Removing: Amazon Q Logs.log"
    rm -f "Amazon Q Logs.log"
    CLEARED_COUNT=$((CLEARED_COUNT + 1))
fi

# Remove .q.log files
while IFS= read -r -d '' file; do
    echo "  Removing: $file"
    rm -f "$file"
    CLEARED_COUNT=$((CLEARED_COUNT + 1))
done < <(find . -name "*.q.log" -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/.next/*" -print0 2>/dev/null || true)

# Remove log directories
if [ -d ".q-logs" ]; then
    echo "  Removing directory: .q-logs"
    rm -rf ".q-logs"
    CLEARED_COUNT=$((CLEARED_COUNT + 1))
fi

if [ -d "amazon-q-logs" ]; then
    echo "  Removing directory: amazon-q-logs"
    rm -rf "amazon-q-logs"
    CLEARED_COUNT=$((CLEARED_COUNT + 1))
fi

if [ $CLEARED_COUNT -eq 0 ]; then
    echo "✅ No Amazon Q log files found"
else
    echo "✅ Cleared $CLEARED_COUNT Amazon Q log file(s)/directory(ies)"
fi

echo ""
echo "💡 Tip: Amazon Q log files are excluded in .gitignore"


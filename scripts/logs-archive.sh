#!/bin/bash

# Archive Amazon Q logs (Bash)
# Archives Amazon Q logs to a timestamped archive

set -e

echo "📦 Archiving Amazon Q logs..."

ARCHIVE_DIR="logs-archive"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
ARCHIVE_NAME="amazon-q-logs-$TIMESTAMP"

# Create archive directory if it doesn't exist
mkdir -p "$ARCHIVE_DIR"

ARCHIVE_PATH="$ARCHIVE_DIR/$ARCHIVE_NAME"
mkdir -p "$ARCHIVE_PATH"

ARCHIVED_COUNT=0

# Archive main log file
if [ -f "Amazon Q Logs.log" ]; then
    echo "  Archiving: Amazon Q Logs.log"
    cp "Amazon Q Logs.log" "$ARCHIVE_PATH/"
    ARCHIVED_COUNT=$((ARCHIVED_COUNT + 1))
fi

# Archive .q.log files
while IFS= read -r -d '' file; do
    RELATIVE_PATH="${file#./}"
    DEST_PATH="$ARCHIVE_PATH/$RELATIVE_PATH"
    DEST_DIR=$(dirname "$DEST_PATH")
    
    mkdir -p "$DEST_DIR"
    echo "  Archiving: $RELATIVE_PATH"
    cp "$file" "$DEST_PATH"
    ARCHIVED_COUNT=$((ARCHIVED_COUNT + 1))
done < <(find . -name "*.q.log" -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/.next/*" -print0 2>/dev/null || true)

# Archive log directories
if [ -d ".q-logs" ]; then
    echo "  Archiving directory: .q-logs"
    cp -r ".q-logs" "$ARCHIVE_PATH/"
    ARCHIVED_COUNT=$((ARCHIVED_COUNT + 1))
fi

if [ -d "amazon-q-logs" ]; then
    echo "  Archiving directory: amazon-q-logs"
    cp -r "amazon-q-logs" "$ARCHIVE_PATH/"
    ARCHIVED_COUNT=$((ARCHIVED_COUNT + 1))
fi

if [ $ARCHIVED_COUNT -eq 0 ]; then
    echo "✅ No Amazon Q log files found to archive"
    rmdir "$ARCHIVE_PATH" 2>/dev/null || true
else
    echo "✅ Archived $ARCHIVED_COUNT Amazon Q log file(s)/directory(ies) to $ARCHIVE_PATH"
    
    # Create archive info file
    cat > "$ARCHIVE_PATH/archive-info.txt" << EOF
Amazon Q Logs Archive
Created: $(date '+%Y-%m-%d %H:%M:%S')
Files Archived: $ARCHIVED_COUNT
Archive Location: $ARCHIVE_PATH
EOF
    
    echo ""
    echo "📁 Archive location: $ARCHIVE_PATH"
    echo "💡 You can now safely clear logs: npm run logs:clear"
fi


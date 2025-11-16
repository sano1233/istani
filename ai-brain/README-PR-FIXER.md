# Automated PR Fixer and Merger

This script automatically fixes and merges all failed pull requests in the repository.

## Features

- 🔍 **Identifies Failed PRs**: Finds all open PRs with merge conflicts or failed CI/CD checks
- 🔧 **Resolves Conflicts**: Automatically resolves merge conflicts using AI (for small files) or git strategies (for large/lock files)
- 🐛 **Fixes Code Issues**: Uses AI to analyze and fix code issues that caused CI/CD failures
- ⏳ **Waits for Checks**: Monitors CI/CD checks and waits for them to pass
- 🔀 **Auto-Merges**: Automatically merges PRs after all issues are resolved

## Usage

### Quick Start

```bash
# From the repository root
./fix-all-prs.sh
```

Or directly:

```bash
node ai-brain/fix-failed-prs.js
```

### Prerequisites

1. **GitHub CLI**: Must be installed and authenticated
   ```bash
   gh auth login
   ```

2. **Node.js**: Version 18+ required

3. **Dependencies**: Install AI brain dependencies
   ```bash
   cd ai-brain && npm install
   ```

4. **Environment Variables** (optional but recommended):
   - `GEMINI_API_KEY`: For AI-powered conflict resolution
   - `ANTHROPIC_API_KEY`: For Claude AI analysis
   - `QWEN_API_KEY`: For Qwen AI analysis

## How It Works

1. **Discovery**: Lists all open PRs and identifies which ones have:
   - Merge conflicts (`mergeable: CONFLICTING`)
   - Failed CI/CD checks

2. **Conflict Resolution**:
   - For small files: Uses AI (Gemini) to intelligently resolve conflicts
   - For large files (>100KB) or lock files: Uses git merge strategies (`--theirs` or `--ours`)
   - Regenerates `package-lock.json` if needed

3. **Code Fixes**:
   - Analyzes failed checks to identify issues
   - Uses AI to suggest and apply fixes
   - Commits and pushes fixes

4. **Check Monitoring**:
   - Waits up to 15 minutes for CI/CD checks to pass
   - Re-checks PR status after fixes

5. **Auto-Merge**:
   - Attempts squash merge first
   - Falls back to merge commit or rebase if needed

## Safety Features

- ✅ Skips draft PRs
- ✅ Handles errors gracefully
- ✅ Provides detailed logging
- ✅ Waits between operations to avoid rate limiting
- ✅ Returns to original branch after processing

## Example Output

```
🔍 Finding all failed pull requests...

Found 30 open PR(s)

Found 29 PR(s) that need fixing:

  - PR #133: sano1233/istani [CONFLICTS, FAILED_CHECKS]
  - PR #132: feat: implement unified secrets management system [CONFLICTS, FAILED_CHECKS]
  ...

🚀 Starting automated fix and merge process...

============================================================
🚀 Processing PR #133
============================================================
📋 PR: sano1233/istani
🔗 URL: https://github.com/sano1233/istani/pull/133
⚠️  PR has merge conflicts

🔧 Resolving merge conflicts for PR #133...
   Fetching latest changes...
   ⚠️  Found 3 conflicted files: .gitignore, package-lock.json, package.json
   Resolving conflict in .gitignore...
   ✅ Resolved conflict in .gitignore using AI
   Using git strategy for large/lock file: package-lock.json
   ✅ Resolved package-lock.json using --theirs strategy
   ✅ Regenerated package-lock.json
   ...
✅ Successfully fixed and merged PR #133
```

## Notes

- The script processes PRs sequentially to avoid rate limiting
- Large files (like `package-lock.json`) are handled with git strategies rather than AI
- The script waits for GitHub to update PR status after pushing changes
- All operations are logged for transparency

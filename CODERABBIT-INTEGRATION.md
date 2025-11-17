# CodeRabbit CLI + Cursor Integration Guide

## Overview

CodeRabbit CLI + Cursor enables autonomous AI development workflows where code gets reviewed for issues before it reaches PR. This integration allows Cursor to automatically review code changes using CodeRabbit's expert issue detection.

## Why Integrate CodeRabbit

- **Expert Issue Detection**: Spots race conditions, memory leaks, and logic errors that generic linters miss
- **AI-Powered Fixes**: Cursor implements fixes with full context from CodeRabbit's analysis
- **Context Preservation**: `--prompt-only` mode gives Cursor succinct context about issues
- **Agentic Development Loop**: AI codes, runs reviews, applies fixes, and iterates autonomously

## Prerequisites

<Warning>
**Windows users:** CodeRabbit CLI requires WSL (Windows Subsystem for Linux) to run on Windows.
</Warning>

## Installation Steps

### Step 1: Install CodeRabbit CLI

```bash
curl -fsSL https://cli.coderabbit.ai/install.sh | sh
```

Restart your shell:
```bash
source ~/.zshrc  # or ~/.bashrc
```

### Step 2: Authenticate CodeRabbit

```bash
coderabbit auth login
```

1. The command provides a URL
2. Open the URL in your browser
3. Log in to CodeRabbit via your git provider
4. Copy the authentication token
5. Paste the token back to your CLI

<Info>
Free accounts get limited reviews per hour. Pro accounts get higher review limits and more robust reviews. See [pricing](https://www.coderabbit.ai/pricing) for details.
</Info>

### Step 3: Verify Authentication

```bash
coderabbit auth status
```

Success shows your login status and confirms everything is set correctly.

### Step 4: Test Cursor Integration

Open Cursor chat (Command + L) and prompt:

```
Let's verify you can run the CodeRabbit CLI. Run the terminal command: coderabbit auth status and tell me the output.
```

### Step 5: Setup Cursor Rule for CodeRabbit

Create a Cursor rule by running `@rule` in Cursor chat and enter:

```
# Running the CodeRabbit CLI

CodeRabbit is already installed in the terminal. Run it as a way to review your code. Run the command: cr -h for details on commands available. In general, I want you to run coderabbit with the `--prompt-only` flag. To review uncommitted changes (this is what we'll use most of the time) run: `coderabbit --prompt-only -t uncommitted`.

IMPORTANT: When running CodeRabbit to review code changes, don't run it more than 3 times in a given set of changes.
```

## Integration Workflow

### Use CodeRabbit as Part of Building New Features

#### Step 1: Request Implementation + Review

Ask Cursor to implement a feature and run CodeRabbit:

```
Please implement phase 7.3 of the planning doc and then run coderabbit --prompt-only -t uncommitted,
let it run as long as it needs and fix any issues.
```

Key components:
- **Implement the feature**: Cursor codes the requested functionality
- **Run CodeRabbit**: Uses `--prompt-only` flag for AI-optimized output
- **Review uncommitted changes**: Uses `-t uncommitted` flag so CodeRabbit only reviews current changes
- **Fix issues**: Cursor addresses all problems CodeRabbit identifies

#### Step 2: Cursor Implements and Runs CodeRabbit

Cursor will:
1. Implement the requested feature
2. Run `coderabbit --prompt-only -t uncommitted`
3. Wait for review (may take 7-30 minutes depending on changes)

#### Step 3: CodeRabbit Analysis and Task Creation

When CodeRabbit completes, Cursor:
1. Reads the `--prompt-only` output (plain text optimized for AI agents)
2. Creates a task list addressing each issue CodeRabbit surfaced
3. Shows you the planned fixes before implementing them

#### Step 4: Automated Issue Resolution

Cursor systematically works through the task list, implementing fixes for each CodeRabbit finding. The cycle continues until all issues are resolved or the limit of 3 times is reached.

## Example: API Integration Implementation

### Working on Payment Webhook Feature

```bash
git checkout -b feature/payment-webhooks
```

### Run Integrated Workflow

Tell Cursor to implement and review:

```
Implement the payment webhook handler from the spec document.
Then run coderabbit --prompt-only -t uncommitted, review the suggestions then fix any critical issues. Ignore nits.
```

### CodeRabbit Analysis

CodeRabbit analyzes the webhook code and identifies issues:
- Missing signature verification
- Race conditions in payment state updates
- Insufficient error handling for network failures
- Webhook replay attack vulnerabilities

### Cursor Fixes

Cursor automatically applies fixes:
- Adds HMAC signature verification
- Implements database transactions for state consistency
- Adds retry logic with exponential backoff
- Includes idempotency key handling

### Verification

The workflow continues until all critical issues are resolved or a set number of loops is reached. Cursor reports completion.

## Optimization Tips

### Use Prompt-Only Mode for Efficiency

When running CodeRabbit manually before Cursor, use `--prompt-only` for optimal AI agent integration:

```bash
coderabbit --prompt-only
```

This mode:
- Provides succinct issue context
- Uses token-efficient formatting
- Includes specific file locations and line numbers
- Suggests fix approaches without overwhelming detail

### Configure CodeRabbit for Cursor

CodeRabbit automatically reads your `cursor.md` file, so you can add context there on:
- How code reviews should run
- Your coding standards
- Architectural preferences

<Info>This is a Pro paid plan feature.</Info>

## Troubleshooting

### CodeRabbit Not Finding Issues

If CodeRabbit isn't detecting expected issues:

1. **Check authentication status**: Run `coderabbit auth status` (authentication improves review quality but isn't required)
2. **Verify git status**: CodeRabbit analyzes tracked changes - check `git status`
3. **Consider review type**: Use the `--type` flag to specify what to review:
   * `coderabbit --type uncommitted` - only uncommitted changes
   * `coderabbit --type committed` - only committed changes
   * `coderabbit --type all` - both committed and uncommitted (default)
4. **Specify base branch**: If your main branch isn't `main`, use `--base`:
   * `coderabbit --base develop`
   * `coderabbit --base master`
5. **Review file types**: CodeRabbit focuses on code files, not docs or configuration

### Managing Review Duration

CodeRabbit reviews may take 7 to 30+ minutes depending on the scope of changes:

1. **Ensure background execution**: Configure Cursor to run CodeRabbit in the background so you can continue working
2. **Review smaller changesets**: Adjust what you're reviewing to reduce analysis time:
   * Use `--type uncommitted` to review only uncommitted changes
   * Work on smaller feature branches compared to main
   * Break large features into smaller, reviewable chunks
3. **Configure the diff scope**: Control what changes are analyzed:
   * **Review uncommitted changes only**: Use `--type uncommitted` to analyze just working directory changes
   * **Configure base branch**: Use `--base develop` or `--base main` to set the comparison point
   * **Use feature branches**: Work on focused feature branches instead of large staging branches

## Integration with Current Workflow

### For Deployment Fixes

When working on deployment fixes, use CodeRabbit to review before creating PR:

```
I've fixed the deployment errors. Please run coderabbit --prompt-only -t uncommitted to review the changes,
then fix any critical issues before we create the PR.
```

### For Feature Development

```
Implement the new workout tracking feature from the spec.
Then run coderabbit --prompt-only -t uncommitted and fix any issues it finds.
```

### For PR Preparation

Before creating a PR, run a final review:

```
Review all uncommitted changes with CodeRabbit and fix any critical issues:
coderabbit --prompt-only -t uncommitted
```

## Quick Reference Commands

```bash
# Check authentication
coderabbit auth status

# Review uncommitted changes (most common)
coderabbit --prompt-only -t uncommitted

# Review committed changes
coderabbit --prompt-only -t committed

# Review all changes
coderabbit --prompt-only -t all

# Review with custom base branch
coderabbit --prompt-only --base develop

# Get help
coderabbit -h
# or
cr -h
```

## Best Practices

1. **Run CodeRabbit Early**: Review code before committing to catch issues early
2. **Use Prompt-Only Mode**: Always use `--prompt-only` when working with Cursor
3. **Limit Review Loops**: Don't run CodeRabbit more than 3 times per changeset
4. **Focus on Critical Issues**: Tell Cursor to fix critical issues and ignore nits
5. **Review Uncommitted Changes**: Use `-t uncommitted` for current work
6. **Break Down Large Changes**: Review smaller chunks for faster analysis

## Integration with GitHub Actions

You can also integrate CodeRabbit into your CI/CD pipeline. See the [CodeRabbit CLI documentation](https://docs.coderabbit.ai/cli/overview) for GitHub Actions integration.

---

**Last Updated**: 2025-01-27  
**Status**: Ready for integration  
**Documentation**: [CodeRabbit CLI Docs](https://docs.coderabbit.ai/cli/overview)

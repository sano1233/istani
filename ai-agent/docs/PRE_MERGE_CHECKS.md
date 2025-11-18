# Pre-Merge Checks Documentation

## Overview

The Pre-Merge Checks system enforces quality gates and organization-specific requirements before pull requests are merged. This feature provides both built-in checks for common requirements and custom checks with natural language instructions.

## Features

- **Built-in Checks**: Four standard checks (Docstring Coverage, PR Title, PR Description, Issue Assessment)
- **Custom Checks**: Define your own validation logic using natural language
- **Enforcement Modes**: Configure checks as `off`, `warning`, or `error`
- **AI-Powered**: Custom checks leverage AI to understand complex requirements
- **Automatic Integration**: Checks run automatically during PR processing

## Built-in Checks

### 1. Docstring Coverage

Verifies that code has adequate documentation coverage.

**Configuration:**

```yaml
docstrings:
  mode: 'warning' # off | warning | error
  threshold: 80 # Percentage threshold (default: 80)
```

**What it checks:**

- Counts function/class definitions in changed files
- Counts docstrings (JSDoc, Python docstrings, etc.)
- Calculates coverage percentage
- Fails if coverage is below threshold

### 2. Pull Request Title

Validates that PR titles follow specified requirements.

**Configuration:**

```yaml
title:
  mode: 'warning'
  requirements: 'Start with an imperative verb; keep under 50 characters.'
```

**What it checks:**

- Title is not empty
- Title length (configurable)
- Imperative verb format (if specified)
- AI-based validation against PR content (if available)

### 3. Pull Request Description

Ensures PR descriptions meet quality standards.

**Configuration:**

```yaml
description:
  mode: 'error'
```

**What it checks:**

- Description is not empty
- Minimum length (50 characters recommended)
- Template compliance (basic check)

### 4. Issue Assessment

Verifies that PRs properly address linked issues.

**Configuration:**

```yaml
issue_assessment:
  mode: 'warning'
```

**What it checks:**

- Linked issues are mentioned in description
- PR scope matches linked issues (AI-based)
- No out-of-scope changes

## Custom Checks

Define custom validation logic using natural language instructions. Custom checks leverage AI to understand and validate complex requirements.

### Example Custom Check

```yaml
custom_checks:
  - name: 'Undocumented Breaking Changes'
    mode: 'warning'
    instructions: 'Pass/fail criteria: All breaking changes to public APIs, CLI flags, environment variables, configuration keys, database schemas, or HTTP/GraphQL endpoints must be documented in the Breaking Change section of the PR description and in CHANGELOG.md. Exclude purely internal or private changes.'
```

### Best Practices for Custom Checks

1. **Be Specific**: Write clear, actionable instructions
2. **One Purpose**: Each check should validate one specific requirement
3. **Testable**: Instructions should be evaluable by AI
4. **Start with Warnings**: Begin in `warning` mode, move to `error` after validation

## Configuration

### YAML Configuration

Create a `.coderabbit.yaml` file in your repository root:

```yaml
reviews:
  pre_merge_checks:
    docstrings:
      mode: 'error'
      threshold: 85
    title:
      mode: 'warning'
      requirements: 'Start with an imperative verb; keep under 50 characters.'
    description:
      mode: 'error'
    issue_assessment:
      mode: 'warning'
    custom_checks:
      - name: 'Security Review Required'
        mode: 'error'
        instructions: 'If this PR touches authentication, authorization, encryption, or data handling code, it must include a security review comment from a security team member.'
```

### Enforcement Modes

- **`off`**: Check is disabled
- **`warning`**: Display warnings but don't block merges (default)
- **`error`**: Block merges until resolved (when Request Changes Workflow is enabled)

## Usage

### Automatic Execution

Pre-merge checks run automatically when:

- A PR is opened
- A PR is updated (new commits)
- A PR is reopened

### Manual Commands

#### CLI Commands

```bash
# Run all pre-merge checks on a PR
istani-agent pre-merge-checks <prNumber>
# or
istani-agent checks <prNumber>

# Evaluate a custom check
istani-agent evaluate-check <prNumber> \
  --name "My Custom Check" \
  --instructions "Check that all API endpoints have rate limiting" \
  --mode warning

# Ignore failed checks for a PR
istani-agent ignore-checks <prNumber>
```

#### PR Comments (Bot Commands)

```markdown
# Run all checks

@coderabbitai run pre-merge checks

# Ignore failed checks

@coderabbitai ignore pre-merge checks

# Evaluate custom check

@coderabbitai evaluate custom pre-merge check --name "Check Name" --instructions "Your instructions here" --mode warning
```

#### API Endpoints

```bash
# Run checks
POST /pre-merge-checks/:prNumber

# Evaluate custom check
POST /pre-merge-checks/:prNumber/evaluate
Body: { "name": "...", "instructions": "...", "mode": "warning" }

# Ignore failed checks
POST /pre-merge-checks/:prNumber/ignore
```

## Results Format

Check results appear in PR comments with the following format:

### Failed Checks Table

| Objective          | Status     | Explanation                             | Resolution                                     |
| ------------------ | ---------- | --------------------------------------- | ---------------------------------------------- |
| Docstring Coverage | ❌ Error   | Coverage: 65% (threshold: 80%)          | Add docstrings to 3 more function(s)           |
| PR Title           | ⚠️ Warning | Title should start with imperative verb | Update title to: Start with an imperative verb |

### Passed Checks (Collapsible)

<details>
<summary>✅ Passed Checks (2)</summary>

| Objective        | Status    | Explanation                                  |
| ---------------- | --------- | -------------------------------------------- |
| PR Description   | ✅ Passed | Description meets requirements               |
| Issue Assessment | ✅ Passed | All 2 linked issue(s) are properly addressed |

</details>

## Blocking Merges

When a check in `error` mode fails, the PR is blocked from merging. The agent will:

1. Submit a "Request Changes" review
2. Display failed checks prominently
3. Prevent auto-merge (if enabled)

To unblock a PR:

1. Fix the issues identified by the checks
2. Or manually ignore the checks (override applies only to that PR)

## Integration with Agent Workflow

Pre-merge checks are integrated into the standard PR processing workflow:

```
1. PR Opened/Updated
   ↓
2. Security Scan
   ↓
3. Analyze PR Changes
   ↓
4. Run Pre-Merge Checks ← NEW
   ↓
5. Code Review
   ↓
6. Post Review Comments (includes check results)
   ↓
7. Run Builds
   ↓
8. Run Tests
   ↓
9. Check if Checks Block Merge ← NEW
   ↓
10. Deploy (if not blocked)
   ↓
11. Auto-Merge (if not blocked)
```

## Troubleshooting

### Checks Not Running

1. Verify `.coderabbit.yaml` exists in repository root
2. Check YAML syntax is valid
3. Ensure checks are not set to `mode: "off"`

### Custom Checks Inconclusive

1. Ensure AI client (Claude) is configured
2. Verify instructions are clear and specific
3. Check that PR has sufficient context

### Checks Blocking Valid PRs

1. Review check configuration
2. Adjust thresholds or requirements
3. Temporarily set problematic checks to `warning` mode
4. Use `ignore-checks` command for specific PRs

## Examples

See `.coderabbit.yaml` in the repository root for a complete example configuration.

## Support

For issues or questions:

- Check logs: `npm run dev` (development mode)
- Review configuration: `istani-agent config`
- Test checks: `istani-agent pre-merge-checks <prNumber>`

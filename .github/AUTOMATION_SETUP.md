# Cursor-Style Automation Setup Guide

This guide explains how to set up and configure the automated "Cursor for GitHub" system in your repository.

## Overview

This automation system provides:
- ✅ AI-powered code generation from plain English descriptions (via GitHub Copilot)
- ✅ Automatic error detection and fixing
- ✅ Automated testing and quality checks
- ✅ Auto-merge when all checks pass
- ✅ 24/7 continuous code improvement

## Prerequisites

- Repository admin access
- GitHub Pro, Team, or Enterprise account (for GitHub Copilot)
- Java 17+ and Maven installed locally (for development)

## Initial Setup Steps

### 1. Branch Protection Rules

Configure branch protection to ensure all checks pass before merging:

1. Navigate to **Settings** → **Branches** → **Add rule**
2. Configure the following settings:

   **Branch name pattern:** `main` (or your default branch)
   
   **Required settings:**
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   
   **Required status checks:**
   - `ai-code-check-and-fix`
   - `code-quality-gate`
   
   **Additional recommended settings:**
   - ✅ Require a pull request before merging
   - ✅ Require approvals: 1
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Allow auto-merge
   - ✅ Automatically delete head branches

3. Click **Create** or **Save changes**

### 2. Pull Request Settings

Enable auto-merge functionality:

1. Navigate to **Settings** → **General** → **Pull Requests**
2. Enable the following options:
   - ✅ Allow auto-merge
   - ✅ Automatically delete head branches
   - ✅ Allow squash merging (recommended)
   
3. Click **Save**

### 3. Code Security Settings

Enable advanced security features:

1. Navigate to **Settings** → **Security & analysis**
2. Enable the following features:
   
   **Dependency management:**
   - ✅ Dependency graph
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates
   
   **Code scanning:**
   - ✅ Code scanning (CodeQL)
   - ✅ Secret scanning (if available)
   
   **GitHub Copilot:**
   - ✅ Copilot Autofix for security vulnerabilities (if available)

3. Click **Enable** for each feature

### 4. GitHub Actions Permissions

Ensure the workflow has necessary permissions:

1. Navigate to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**, select:
   - ✅ Read and write permissions
   - ✅ Allow GitHub Actions to create and approve pull requests

3. Click **Save**

## How the Automation Works

### Workflow Triggers

The automation triggers on:
- **Pull Requests:** opened, synchronize, reopened
- **Push to main:** Direct pushes to the main branch

### Automated Workflow Steps

#### Job 1: ai-code-check-and-fix

This job performs automated fixes on pull requests:

1. **Checkout:** Fetches the PR code with full history
2. **Setup Java:** Configures JDK 17 with Maven caching
3. **Build:** Compiles the project (`mvn clean compile`)
4. **Test:** Runs tests (continues on error to allow fixes)
5. **Format:** Applies Google Java Format (v1.19.2)
6. **Bug Detection:** Runs SpotBugs for security/bug detection
7. **Spotless:** Applies code formatting rules
8. **Commit:** Commits any auto-fixes with bot identity
9. **Re-test:** Runs tests again after fixes
10. **Auto-merge:** Enables auto-merge if all checks pass

#### Job 2: code-quality-gate

This job enforces quality standards:

1. **Verify:** Runs `mvn verify` (must pass)
2. **PMD Check:** Runs static analysis (must pass)
3. **Checkstyle:** Validates code style (must pass)

All checks must pass for the PR to be mergeable.

### Bot Commit Identity

Auto-fixes are committed as:
- **Name:** `github-actions[bot]`
- **Email:** `github-actions[bot]@users.noreply.github.com`

## Using GitHub Copilot for Code Generation

### Enabling Copilot

1. Install the GitHub Copilot extension in your IDE:
   - **VS Code:** Install "GitHub Copilot" extension
   - **IntelliJ IDEA:** Install "GitHub Copilot" plugin
   - **Neovim/Vim:** Use `github/copilot.vim`

2. Sign in with your GitHub account
3. Ensure your account has Copilot access

### Writing Effective Prompts

Use natural language comments to describe what you want:

```java
// Create a REST controller for user management with CRUD operations
```

Copilot will suggest complete implementations. Press **Tab** to accept suggestions.

### Inline Chat (Copilot Chat)

Use Copilot Chat for complex requests:
- **VS Code:** Press `Ctrl+I` (Windows/Linux) or `Cmd+I` (Mac)
- **IntelliJ IDEA:** Press `Ctrl+Shift+A` and search for "Copilot Chat"

Example prompts:
- "Generate a Spring Boot REST API for managing products"
- "Add validation annotations to this entity"
- "Create unit tests for this service class"

## Workflow Behavior

### When a PR is Created

1. The `ai-code-check-and-fix` job runs automatically
2. Code is built and tested
3. Automatic formatting is applied
4. SpotBugs scans for issues
5. Any fixes are committed back to the PR
6. Tests are re-run after fixes
7. The `code-quality-gate` job runs
8. If all checks pass, auto-merge is enabled

### Auto-Merge Activation

Auto-merge will automatically merge the PR when:
- ✅ All required status checks pass
- ✅ Branch is up to date with base branch
- ✅ Branch protection rules are satisfied
- ✅ No blocking reviews

### Manual Intervention

You can still manually merge or close PRs at any time. The automation respects manual actions.

## Verifying Auto-Merge is Working

### Test the Workflow

1. Create a test branch:
   ```bash
   git checkout -b test-automation
   ```

2. Make a simple change to a Java file
3. Commit and push:
   ```bash
   git add .
   git commit -m "Test: Add sample code"
   git push -u origin test-automation
   ```

4. Create a pull request
5. Observe the workflow running in the **Actions** tab
6. Check if auto-fixes are committed
7. Verify auto-merge is enabled (look for "Auto-merge enabled" label)

### Checking Workflow Status

- **Actions Tab:** View real-time workflow execution
- **PR Checks:** See check status directly on the PR
- **Commit History:** Review bot commits for auto-fixes

## Troubleshooting

### Auto-Merge Not Enabled

**Possible causes:**
- Branch protection rules not configured
- Required checks not selected
- "Allow auto-merge" setting disabled
- Missing permissions for GitHub Actions

**Solution:** Review steps 1-4 in Initial Setup

### Workflow Fails on Compile

**Possible causes:**
- Invalid Java code
- Missing dependencies in pom.xml
- Incorrect Java version

**Solution:** Fix compilation errors locally first, then push

### Formatting Changes Not Committed

**Possible causes:**
- No actual formatting changes needed
- Git configuration issues

**Solution:** The workflow only commits if changes are detected

### Tests Failing After Auto-Fix

**Possible causes:**
- Auto-formatting broke test assertions
- Tests were already failing

**Solution:** Review the changes and fix tests manually

## Best Practices

### 1. Write Clear Commit Messages

Even with automation, clear commit messages help track changes:
```bash
git commit -m "feat: Add user authentication service"
```

### 2. Use Copilot Effectively

- Write descriptive comments before code
- Review Copilot suggestions before accepting
- Use inline chat for complex implementations

### 3. Review Auto-Fixes

Always review the auto-fix commits to understand what was changed.

### 4. Keep Dependencies Updated

Regularly update Maven dependencies to benefit from security patches.

### 5. Monitor Workflow Runs

Check the Actions tab periodically to ensure workflows are running smoothly.

## Advanced Configuration

### Customizing Code Style

Edit the `pom.xml` to customize formatting rules:

```xml
<plugin>
    <groupId>com.diffplug.spotless</groupId>
    <artifactId>spotless-maven-plugin</artifactId>
    <configuration>
        <java>
            <googleJavaFormat>
                <version>1.19.2</version>
                <style>AOSP</style> <!-- Change to AOSP style -->
            </googleJavaFormat>
        </java>
    </configuration>
</plugin>
```

### Adjusting SpotBugs Sensitivity

Modify SpotBugs configuration in `pom.xml`:

```xml
<plugin>
    <groupId>com.github.spotbugs</groupId>
    <artifactId>spotbugs-maven-plugin</artifactId>
    <configuration>
        <effort>Max</effort>
        <threshold>High</threshold> <!-- Change from Low to High -->
    </configuration>
</plugin>
```

### Adding Custom Checkstyle Rules

Create a custom checkstyle configuration file and reference it:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-checkstyle-plugin</artifactId>
    <configuration>
        <configLocation>checkstyle.xml</configLocation>
    </configuration>
</plugin>
```

## Support and Feedback

For issues or questions:
1. Check the [GitHub Actions documentation](https://docs.github.com/en/actions)
2. Review workflow logs in the Actions tab
3. Open an issue in this repository

## Summary

This automation system transforms your GitHub repository into a "Cursor-like" experience with:
- 🤖 AI-powered code generation via GitHub Copilot
- 🔧 Automatic error detection and fixing
- ✅ Continuous quality checks
- 🚀 Zero-touch merging for safe changes
- 📊 Comprehensive security scanning

Follow the setup steps above to enable 24/7 continuous code improvement!

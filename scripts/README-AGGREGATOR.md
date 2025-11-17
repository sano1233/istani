# GitHub Repository Aggregator

A Node.js script that aggregates metadata, recent commits, and open issues from specified GitHub repositories into a single JSON file using the official Octokit REST API.

## 📋 Overview

This tool helps you collect and consolidate information from multiple GitHub repositories into a structured JSON format. It's perfect for:

- **Repository dashboards**: Display insights from multiple repositories in one place
- **Project monitoring**: Track activity across your connected repositories
- **Data analysis**: Analyze patterns across multiple projects
- **Documentation**: Generate automated repository reports

## ✨ Features

- **Repository Metadata**: Stars, forks, description, language, topics, and more
- **Recent Commits**: Configurable number of recent commits per repository
- **Open Issues**: Fetch and track open issues across repositories
- **Rate Limit Awareness**: Checks GitHub API rate limits before and after execution
- **Error Handling**: Gracefully handles failures and continues with other repositories
- **Secure**: Reads GitHub token from environment variables (no hard-coded secrets)
- **Customizable**: Easy to modify repository list and fetch limits

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- A GitHub Personal Access Token
- Access to the repositories you want to aggregate

### Installation

1. **Install dependencies**:

```bash
npm install @octokit/rest
```

2. **Set up your GitHub token**:

Create a GitHub Personal Access Token:

- Go to https://github.com/settings/tokens
- Click **"Generate new token (classic)"**
- Select the following scopes:
  - `repo` (all sub-scopes for full repository access)
  - `read:org` (if aggregating from organization repositories)
- Click **"Generate token"**
- Copy the token (you won't see it again!)

3. **Configure environment variable**:

```bash
# Linux/Mac
export GITHUB_TOKEN=your_personal_access_token_here

# Windows (Command Prompt)
set GITHUB_TOKEN=your_personal_access_token_here

# Windows (PowerShell)
$env:GITHUB_TOKEN="your_personal_access_token_here"
```

Or add it to your `.env.local` file:

```env
GITHUB_TOKEN=your_personal_access_token_here
```

### Usage

Run the aggregator script:

```bash
node scripts/aggregateRepos.js
```

The script will:

1. Check your GitHub API rate limit
2. Fetch data from all configured repositories
3. Save the results to `data/reposData.json`
4. Display a summary of the aggregation

### Expected Output

```
🚀 GitHub Repository Aggregator

📋 Repositories to aggregate: 10
📝 Commits per repo: 5
📝 Issues per repo: 5

⏱️  GitHub API Rate Limit:
   Remaining: 4998/5000
   Resets at: 11/17/2025, 9:37:00 AM

🔄 Starting aggregation...

📊 Aggregating data for sano1233/codex...
  ✅ Fetched: 5 commits, 5 issues
📊 Aggregating data for sano1233/n8n...
  ✅ Fetched: 5 commits, 3 issues
...

✅ Successfully wrote aggregated data to: /path/to/istani/data/reposData.json
📊 Summary:
   Total repositories: 10
   Successful: 10
   Failed: 0

⏱️  Total execution time: 12.45s
✨ Aggregation complete!
```

## 📁 Output Format

The script generates a JSON file at `data/reposData.json` with the following structure:

```json
{
  "generatedAt": "2025-11-17T08:37:00.000Z",
  "totalRepositories": 10,
  "successfulAggregations": 10,
  "failedAggregations": 0,
  "repositories": [
    {
      "repository": "sano1233/codex",
      "metadata": {
        "name": "codex",
        "fullName": "sano1233/codex",
        "description": "Repository description",
        "url": "https://github.com/sano1233/codex",
        "homepage": "https://example.com",
        "language": "JavaScript",
        "stars": 42,
        "forks": 7,
        "watchers": 42,
        "openIssues": 5,
        "defaultBranch": "main",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2025-11-17T08:00:00Z",
        "pushedAt": "2025-11-17T07:30:00Z",
        "size": 1234,
        "visibility": "public",
        "topics": ["javascript", "nodejs"]
      },
      "recentCommits": [
        {
          "sha": "abc123...",
          "message": "feat: add new feature",
          "author": {
            "name": "Developer Name",
            "email": "dev@example.com",
            "date": "2025-11-17T07:30:00Z"
          },
          "committer": {
            "name": "Developer Name",
            "date": "2025-11-17T07:30:00Z"
          },
          "url": "https://github.com/sano1233/codex/commit/abc123"
        }
      ],
      "openIssues": [
        {
          "number": 123,
          "title": "Issue title",
          "body": "Issue description (truncated to 500 chars)...",
          "state": "open",
          "author": "username",
          "labels": ["bug", "enhancement"],
          "createdAt": "2025-11-15T00:00:00Z",
          "updatedAt": "2025-11-16T00:00:00Z",
          "comments": 3,
          "url": "https://github.com/sano1233/codex/issues/123",
          "isPullRequest": false
        }
      ],
      "aggregatedAt": "2025-11-17T08:37:00.000Z"
    }
  ]
}
```

## ⚙️ Configuration

### Customizing Repository List

Edit the `repos` array in `scripts/aggregateRepos.js`:

```javascript
const repos = [
  'sano1233/codex',
  'sano1233/n8n',
  'sano1233/next.js',
  'sano1233/istani',
  // Add your repositories here
  'owner/repo-name',
];
```

### Adjusting Fetch Limits

Modify the constants at the top of the script:

```javascript
const COMMITS_LIMIT = 5; // Number of commits to fetch per repository
const ISSUES_LIMIT = 5; // Number of open issues to fetch per repository
```

**Note**: Higher limits will consume more API quota. GitHub's rate limit for authenticated requests is 5,000 requests per hour.

### Changing Output Location

Modify the output path constants:

```javascript
const OUTPUT_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'reposData.json');
```

## 🔒 Security Best Practices

1. **Never commit your GitHub token**: Always use environment variables
2. **Use token with minimal permissions**: Only grant `repo` and `read:org` scopes
3. **Keep tokens secret**: Don't share or expose them in logs
4. **Rotate tokens regularly**: Generate new tokens periodically
5. **Add to .gitignore**: Ensure `.env` and `.env.local` are ignored
6. **Use token expiration**: Set an expiration date when creating tokens

## 📊 GitHub API Rate Limits

- **Authenticated requests**: 5,000 requests per hour
- **Unauthenticated requests**: 60 requests per hour (not recommended)

The script makes approximately 3-4 API calls per repository:

- 1 call for repository metadata
- 1 call for commits
- 1 call for issues
- 1-2 calls for rate limit checks

**Example**: Aggregating 10 repositories = ~30-40 API calls

## 🛠️ Troubleshooting

### Error: GITHUB_TOKEN not set

**Solution**: Set the environment variable as described in the Quick Start section.

### Error: Not Found (404)

**Possible causes**:

- Repository doesn't exist or was renamed
- You don't have access to the repository
- Token doesn't have required permissions

**Solution**: Verify the repository name and your token permissions.

### Error: API rate limit exceeded

**Solution**: Wait until the rate limit resets (check the reset time in the error message) or use a different token.

### No issues or commits returned

**Possible causes**:

- Repository has no commits or issues
- Branch protection or access restrictions

**Solution**: Check the repository directly on GitHub to verify the data exists.

## 🔄 Integration with Istani

You can use the generated `reposData.json` in your Istani application:

```javascript
// Example: Reading the aggregated data
import reposData from '../data/reposData.json';

// Display repository statistics
reposData.repositories.forEach((repo) => {
  console.log(`${repo.metadata.fullName}:`);
  console.log(`  Stars: ${repo.metadata.stars}`);
  console.log(`  Recent commits: ${repo.recentCommits.length}`);
  console.log(`  Open issues: ${repo.openIssues.length}`);
});
```

### Creating a Dashboard Component

```typescript
// Example React component
import React from 'react';
import reposData from '@/data/reposData.json';

export function RepositoryDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {reposData.repositories.map((repo) => (
        <div key={repo.repository} className="p-4 border rounded-lg">
          <h3 className="font-bold">{repo.metadata.name}</h3>
          <p className="text-sm text-gray-600">{repo.metadata.description}</p>
          <div className="mt-2 flex gap-4 text-sm">
            <span>⭐ {repo.metadata.stars}</span>
            <span>🔱 {repo.metadata.forks}</span>
            <span>📝 {repo.openIssues.length} issues</span>
          </div>
        </div>
      ))}
    </div>
  );
}
```

## 📝 Automation

### Run on a Schedule

Add to your `package.json`:

```json
{
  "scripts": {
    "aggregate": "node scripts/aggregateRepos.js",
    "aggregate:watch": "watch 'npm run aggregate' scripts/"
  }
}
```

### Using Cron (Linux/Mac)

```bash
# Run every hour
0 * * * * cd /path/to/istani && node scripts/aggregateRepos.js
```

### Using GitHub Actions

Create `.github/workflows/aggregate-repos.yml`:

```yaml
name: Aggregate Repositories
on:
  schedule:
    - cron: '0 * * * *' # Every hour
  workflow_dispatch:

jobs:
  aggregate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: node scripts/aggregateRepos.js
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - uses: actions/upload-artifact@v3
        with:
          name: repos-data
          path: data/reposData.json
```

## 🤝 Contributing

Feel free to customize this script for your needs. Possible enhancements:

- Add support for repository languages breakdown
- Fetch pull requests in addition to issues
- Add contributors statistics
- Generate markdown reports
- Add data visualization
- Support for private repositories
- Filtering by repository topics or languages

## 📄 License

This script is part of the Istani project and follows the same license.

## 🔗 Related Resources

- [Octokit REST API Documentation](https://octokit.github.io/rest.js/)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [Creating a Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub Rate Limits](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting)

---

**Need help?** Open an issue in the Istani repository or check the troubleshooting section above.

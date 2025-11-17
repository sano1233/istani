# Repository Aggregator Integration Examples

This guide shows you how to integrate the aggregated repository data into your Istani application.

## Quick Start

After running `npm run aggregate`, you'll have a `data/reposData.json` file containing all repository data. Here are various ways to use it:

## Example 1: Simple Statistics Display

```typescript
import { loadRepoData, getTotalStars, getTotalForks } from '@/lib/repoDataUtils';

export async function RepoStats() {
  const data = await loadRepoData();

  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <h3>Total Repositories</h3>
        <p>{data.totalRepositories}</p>
      </div>
      <div>
        <h3>Total Stars</h3>
        <p>{getTotalStars(data)}</p>
      </div>
      <div>
        <h3>Total Forks</h3>
        <p>{getTotalForks(data)}</p>
      </div>
    </div>
  );
}
```

## Example 2: Recent Activity Feed

```typescript
import { loadRepoData, getRecentCommits } from '@/lib/repoDataUtils';

export async function ActivityFeed() {
  const data = await loadRepoData();
  const recentCommits = getRecentCommits(data, 5);

  return (
    <div className="space-y-4">
      <h2>Recent Activity</h2>
      {recentCommits.map((commit) => (
        <div key={commit.sha} className="border-l-4 border-blue-500 pl-4">
          <p className="font-medium">{commit.message}</p>
          <p className="text-sm text-gray-600">
            {commit.repoName} • {commit.author.name} •
            {new Date(commit.author.date).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}
```

## Example 3: Repository Cards

```typescript
import { loadRepoData } from '@/lib/repoDataUtils';

export async function RepoGrid() {
  const data = await loadRepoData();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {data.repositories.map((repo) => (
        <div key={repo.repository} className="p-6 border rounded-lg">
          <h3 className="font-bold">{repo.metadata.name}</h3>
          <p className="text-sm text-gray-600">{repo.metadata.description}</p>
          <div className="mt-4 flex gap-4 text-sm">
            <span>⭐ {repo.metadata.stars}</span>
            <span>🔱 {repo.metadata.forks}</span>
            <span>📝 {repo.openIssues.length}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Example 4: Language Statistics

```typescript
import { loadRepoData, getLanguages, getReposByLanguage } from '@/lib/repoDataUtils';

export async function LanguageStats() {
  const data = await loadRepoData();
  const languages = getLanguages(data);

  return (
    <div>
      <h2>Languages Used</h2>
      <div className="space-y-2">
        {languages.map((lang) => {
          const repos = getReposByLanguage(data, lang);
          return (
            <div key={lang} className="flex justify-between">
              <span>{lang}</span>
              <span className="text-gray-600">{repos.length} repos</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

## Example 5: Issues Dashboard

```typescript
import { loadRepoData, getRecentIssues } from '@/lib/repoDataUtils';

export async function IssuesDashboard() {
  const data = await loadRepoData();
  const issues = getRecentIssues(data, 10);

  return (
    <div>
      <h2>Recent Issues</h2>
      <div className="space-y-4">
        {issues.map((issue) => (
          <a
            key={`${issue.repoName}-${issue.number}`}
            href={issue.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 border rounded hover:bg-gray-50"
          >
            <div className="flex items-start gap-2">
              <span className="text-2xl">🐛</span>
              <div className="flex-1">
                <h3 className="font-medium">{issue.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {issue.repoName} #{issue.number} • opened by {issue.author}
                </p>
                <div className="flex gap-2 mt-2">
                  {issue.labels.map((label) => (
                    <span
                      key={label}
                      className="text-xs bg-gray-100 px-2 py-1 rounded"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
```

## Example 6: Using in API Routes

```typescript
// app/api/repos/route.ts
import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'reposData.json');
    const data = await readFile(dataPath, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load repository data' }, { status: 500 });
  }
}
```

## Example 7: Client-Side Fetching

```typescript
'use client';

import { useState, useEffect } from 'react';
import type { ReposData } from '@/lib/repoDataUtils';

export function ClientRepoView() {
  const [data, setData] = useState<ReposData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/repos')
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data available</div>;

  return (
    <div>
      <h2>Repositories: {data.totalRepositories}</h2>
      {/* Your component content */}
    </div>
  );
}
```

## Example 8: Activity Indicators

```typescript
import { loadRepoData, getRepoStats, formatRelativeTime } from '@/lib/repoDataUtils';

export async function ActivityIndicators() {
  const data = await loadRepoData();

  return (
    <div className="space-y-4">
      {data.repositories.map((repo) => {
        const stats = getRepoStats(repo);
        return (
          <div key={repo.repository} className="flex items-center gap-4 p-4 border rounded">
            <div className={`w-3 h-3 rounded-full ${stats.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
            <div className="flex-1">
              <h3 className="font-medium">{stats.name}</h3>
              {stats.lastCommit && (
                <p className="text-sm text-gray-600">
                  Last commit: {formatRelativeTime(stats.lastCommit)}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Activity Score</div>
              <div className="text-2xl font-bold">{stats.isActive ? '🟢' : '🟡'}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

## Example 9: Search and Filter

```typescript
'use client';

import { useState } from 'react';
import type { Repository } from '@/lib/repoDataUtils';

export function RepoSearch({ repositories }: { repositories: Repository[] }) {
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('all');

  const filtered = repositories.filter((repo) => {
    const matchesSearch = repo.metadata.name.toLowerCase().includes(search.toLowerCase()) ||
                         repo.metadata.description?.toLowerCase().includes(search.toLowerCase());
    const matchesLanguage = language === 'all' || repo.metadata.language === language;
    return matchesSearch && matchesLanguage;
  });

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search repositories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded"
        />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="all">All Languages</option>
          <option value="TypeScript">TypeScript</option>
          <option value="JavaScript">JavaScript</option>
          <option value="Python">Python</option>
        </select>
      </div>

      <div className="space-y-4">
        {filtered.map((repo) => (
          <div key={repo.repository} className="p-4 border rounded">
            <h3>{repo.metadata.name}</h3>
            <p className="text-sm text-gray-600">{repo.metadata.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Example 10: Full Dashboard Component

See `components/repo-dashboard.tsx` for a complete, production-ready dashboard component that showcases all the features of the repository aggregator.

## Best Practices

1. **Server-Side Rendering**: Use Next.js server components when possible for better performance
2. **Caching**: Implement caching for the repository data to avoid repeated file reads
3. **Error Handling**: Always handle cases where data might not be available
4. **Incremental Updates**: Run the aggregator on a schedule (via GitHub Actions or cron)
5. **Loading States**: Show loading indicators while fetching data
6. **Responsive Design**: Ensure your components work well on all screen sizes

## API Integration

Instead of reading files directly, consider creating an API endpoint:

```typescript
// app/api/repos/stats/route.ts
import { loadRepoData, getTotalStars, getTotalForks } from '@/lib/repoDataUtils';
import { NextResponse } from 'next/server';

export async function GET() {
  const data = await loadRepoData();

  return NextResponse.json({
    totalRepos: data.totalRepositories,
    totalStars: getTotalStars(data),
    totalForks: getTotalForks(data),
    lastUpdated: data.generatedAt,
  });
}
```

## Automation

The included GitHub Actions workflow (`.github/workflows/aggregate-repos.yml`) automatically:

- Runs every 6 hours
- Commits updated data to the repository
- Creates artifacts for download

You can also trigger it manually from the Actions tab in GitHub.

## TypeScript Support

All utilities in `lib/repoDataUtils.ts` are fully typed for TypeScript projects. Import the types:

```typescript
import type { ReposData, Repository, CommitData, IssueData } from '@/lib/repoDataUtils';
```

---

For more examples and documentation, see:

- `scripts/README-AGGREGATOR.md` - Main aggregator documentation
- `components/repo-dashboard.tsx` - Full dashboard example
- `lib/repoDataUtils.ts` - Utility functions

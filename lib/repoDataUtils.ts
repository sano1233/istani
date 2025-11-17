/**
 * Utility functions for working with aggregated repository data
 *
 * These helpers make it easier to process and display data from
 * the repository aggregator (scripts/aggregateRepos.js)
 */

export interface CommitData {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  committer: {
    name: string;
    date: string;
  };
  url: string;
}

export interface IssueData {
  number: number;
  title: string;
  body: string;
  state: string;
  author: string;
  labels: string[];
  createdAt: string;
  updatedAt: string;
  comments: number;
  url: string;
  isPullRequest: boolean;
}

export interface RepoMetadata {
  name: string;
  fullName: string;
  description: string;
  url: string;
  homepage: string | null;
  language: string;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  size: number;
  visibility: string;
  topics: string[];
}

export interface Repository {
  repository: string;
  metadata: RepoMetadata;
  recentCommits: CommitData[];
  openIssues: IssueData[];
  aggregatedAt: string;
  error?: string;
}

export interface ReposData {
  generatedAt: string;
  totalRepositories: number;
  successfulAggregations: number;
  failedAggregations: number;
  repositories: Repository[];
}

/**
 * Load repository data from JSON file or API
 */
export async function loadRepoData(): Promise<ReposData> {
  const response = await fetch('/data/reposData.json');

  if (!response.ok) {
    throw new Error('Failed to load repository data. Run `npm run aggregate` first.');
  }

  return response.json();
}

/**
 * Get total stars across all repositories
 */
export function getTotalStars(data: ReposData): number {
  return data.repositories.reduce((total, repo) => {
    return total + (repo.metadata?.stars || 0);
  }, 0);
}

/**
 * Get total forks across all repositories
 */
export function getTotalForks(data: ReposData): number {
  return data.repositories.reduce((total, repo) => {
    return total + (repo.metadata?.forks || 0);
  }, 0);
}

/**
 * Get total open issues across all repositories
 */
export function getTotalOpenIssues(data: ReposData): number {
  return data.repositories.reduce((total, repo) => {
    return total + repo.openIssues.length;
  }, 0);
}

/**
 * Get repositories sorted by stars (descending)
 */
export function getReposByStars(data: ReposData): Repository[] {
  return [...data.repositories].sort((a, b) => (b.metadata?.stars || 0) - (a.metadata?.stars || 0));
}

/**
 * Get repositories sorted by recent activity (last push)
 */
export function getReposByActivity(data: ReposData): Repository[] {
  return [...data.repositories].sort((a, b) => {
    const dateA = new Date(a.metadata?.pushedAt || 0).getTime();
    const dateB = new Date(b.metadata?.pushedAt || 0).getTime();
    return dateB - dateA;
  });
}

/**
 * Get all unique programming languages used
 */
export function getLanguages(data: ReposData): string[] {
  const languages = new Set<string>();
  data.repositories.forEach((repo) => {
    if (repo.metadata?.language) {
      languages.add(repo.metadata.language);
    }
  });
  return Array.from(languages).sort();
}

/**
 * Get repositories by language
 */
export function getReposByLanguage(data: ReposData, language: string): Repository[] {
  return data.repositories.filter((repo) => repo.metadata?.language === language);
}

/**
 * Get all unique topics across repositories
 */
export function getAllTopics(data: ReposData): string[] {
  const topics = new Set<string>();
  data.repositories.forEach((repo) => {
    repo.metadata?.topics?.forEach((topic) => topics.add(topic));
  });
  return Array.from(topics).sort();
}

/**
 * Get repositories by topic
 */
export function getReposByTopic(data: ReposData, topic: string): Repository[] {
  return data.repositories.filter((repo) => repo.metadata?.topics?.includes(topic));
}

/**
 * Get most recent commits across all repositories
 */
export function getRecentCommits(
  data: ReposData,
  limit = 10,
): Array<CommitData & { repoName: string }> {
  const allCommits: Array<CommitData & { repoName: string }> = [];

  data.repositories.forEach((repo) => {
    repo.recentCommits.forEach((commit) => {
      allCommits.push({
        ...commit,
        repoName: repo.metadata?.name || repo.repository,
      });
    });
  });

  return allCommits
    .sort((a, b) => {
      const dateA = new Date(a.author.date).getTime();
      const dateB = new Date(b.author.date).getTime();
      return dateB - dateA;
    })
    .slice(0, limit);
}

/**
 * Get most recent issues across all repositories
 */
export function getRecentIssues(
  data: ReposData,
  limit = 10,
): Array<IssueData & { repoName: string }> {
  const allIssues: Array<IssueData & { repoName: string }> = [];

  data.repositories.forEach((repo) => {
    repo.openIssues.forEach((issue) => {
      allIssues.push({
        ...issue,
        repoName: repo.metadata?.name || repo.repository,
      });
    });
  });

  return allIssues
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    })
    .slice(0, limit);
}

/**
 * Get repository statistics summary
 */
export function getRepoStats(repo: Repository) {
  const hasError = !!repo.error;
  const lastCommitDate = repo.recentCommits[0]?.author.date;
  const daysSinceLastCommit = lastCommitDate
    ? Math.floor((Date.now() - new Date(lastCommitDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return {
    name: repo.metadata?.name || repo.repository,
    stars: repo.metadata?.stars || 0,
    forks: repo.metadata?.forks || 0,
    openIssues: repo.openIssues.length,
    recentCommits: repo.recentCommits.length,
    language: repo.metadata?.language || 'Unknown',
    topics: repo.metadata?.topics || [],
    lastCommit: lastCommitDate,
    daysSinceLastCommit,
    isActive: daysSinceLastCommit !== null && daysSinceLastCommit < 30,
    hasError,
  };
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;
  return `${Math.floor(seconds / 31536000)}y ago`;
}

/**
 * Truncate commit message to specified length
 */
export function truncateMessage(message: string, maxLength = 50): string {
  const firstLine = message.split('\n')[0];
  if (firstLine.length <= maxLength) return firstLine;
  return firstLine.substring(0, maxLength - 3) + '...';
}

/**
 * Get activity score for a repository (higher = more active)
 */
export function getActivityScore(repo: Repository): number {
  let score = 0;

  // Recent commits (up to 50 points)
  score += Math.min(repo.recentCommits.length * 10, 50);

  // Recent issues (up to 30 points)
  score += Math.min(repo.openIssues.length * 5, 30);

  // Stars (up to 20 points, logarithmic scale)
  if (repo.metadata?.stars) {
    score += Math.min(Math.log10(repo.metadata.stars + 1) * 5, 20);
  }

  return Math.round(score);
}

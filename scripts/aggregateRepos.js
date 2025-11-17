#!/usr/bin/env node

/**
 * GitHub Repository Aggregator
 *
 * This script aggregates metadata, recent commits, and open issues from specified
 * GitHub repositories into a single JSON file using the Octokit REST API.
 *
 * Features:
 * - Fetches repository metadata (stars, forks, description, etc.)
 * - Retrieves recent commits (configurable limit)
 * - Fetches open issues (configurable limit)
 * - Outputs structured JSON data for consumption by other applications
 * - Respects GitHub API rate limits
 *
 * Environment Variables:
 * - GITHUB_TOKEN: Personal Access Token for GitHub API authentication (required)
 *
 * Usage:
 *   node scripts/aggregateRepos.js
 */

const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const path = require('path');

// Configuration constants
const COMMITS_LIMIT = 5; // Number of commits to fetch per repository
const ISSUES_LIMIT = 5; // Number of open issues to fetch per repository
const OUTPUT_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'reposData.json');

// List of repositories to aggregate
// Format: "owner/repo"
const repos = [
  'sano1233/codex',
  'sano1233/n8n',
  'sano1233/next.js',
  'sano1233/istani',
  'sano1233/supabase',
  'sano1233/stripe',
  'sano1233/vercel',
  'sano1233/react',
  'sano1233/tailwindcss',
  'sano1233/typescript',
];

/**
 * Initialize Octokit client with authentication
 */
function initializeOctokit() {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    console.error('❌ Error: GITHUB_TOKEN environment variable is not set.');
    console.error('Please set your GitHub Personal Access Token:');
    console.error('  export GITHUB_TOKEN=your_token_here');
    console.error('\nTo create a token:');
    console.error('  1. Go to https://github.com/settings/tokens');
    console.error('  2. Click "Generate new token (classic)"');
    console.error('  3. Select scopes: repo (all), read:org');
    console.error('  4. Copy the token and set it as an environment variable');
    process.exit(1);
  }

  return new Octokit({ auth: token });
}

/**
 * Parse repository string into owner and repo
 * @param {string} repoString - Repository in format "owner/repo"
 * @returns {{owner: string, repo: string}}
 */
function parseRepo(repoString) {
  const [owner, repo] = repoString.split('/');
  return { owner, repo };
}

/**
 * Fetch repository metadata
 * @param {Octokit} octokit - Octokit client instance
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} Repository metadata
 */
async function fetchRepoMetadata(octokit, owner, repo) {
  try {
    const { data } = await octokit.repos.get({ owner, repo });

    return {
      name: data.name,
      fullName: data.full_name,
      description: data.description,
      url: data.html_url,
      homepage: data.homepage,
      language: data.language,
      stars: data.stargazers_count,
      forks: data.forks_count,
      watchers: data.watchers_count,
      openIssues: data.open_issues_count,
      defaultBranch: data.default_branch,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      pushedAt: data.pushed_at,
      size: data.size,
      visibility: data.visibility,
      topics: data.topics || [],
    };
  } catch (error) {
    console.error(`❌ Error fetching metadata for ${owner}/${repo}:`, error.message);
    throw error;
  }
}

/**
 * Fetch recent commits for a repository
 * @param {Octokit} octokit - Octokit client instance
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} limit - Number of commits to fetch
 * @returns {Promise<Array>} Array of commit objects
 */
async function fetchRecentCommits(octokit, owner, repo, limit = COMMITS_LIMIT) {
  try {
    const { data } = await octokit.repos.listCommits({
      owner,
      repo,
      per_page: limit,
    });

    return data.map((commit) => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: {
        name: commit.commit.author.name,
        email: commit.commit.author.email,
        date: commit.commit.author.date,
      },
      committer: {
        name: commit.commit.committer.name,
        date: commit.commit.committer.date,
      },
      url: commit.html_url,
      stats: commit.stats, // May be undefined in list view
    }));
  } catch (error) {
    console.error(`❌ Error fetching commits for ${owner}/${repo}:`, error.message);
    return [];
  }
}

/**
 * Fetch open issues for a repository
 * @param {Octokit} octokit - Octokit client instance
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} limit - Number of issues to fetch
 * @returns {Promise<Array>} Array of issue objects
 */
async function fetchOpenIssues(octokit, owner, repo, limit = ISSUES_LIMIT) {
  try {
    const { data } = await octokit.issues.listForRepo({
      owner,
      repo,
      state: 'open',
      per_page: limit,
      sort: 'created',
      direction: 'desc',
    });

    return data.map((issue) => ({
      number: issue.number,
      title: issue.title,
      body: issue.body ? issue.body.substring(0, 500) : '', // Truncate long bodies
      state: issue.state,
      author: issue.user.login,
      labels: issue.labels.map((label) => label.name),
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      comments: issue.comments,
      url: issue.html_url,
      isPullRequest: !!issue.pull_request,
    }));
  } catch (error) {
    console.error(`❌ Error fetching issues for ${owner}/${repo}:`, error.message);
    return [];
  }
}

/**
 * Aggregate data for a single repository
 * @param {Octokit} octokit - Octokit client instance
 * @param {string} repoString - Repository in format "owner/repo"
 * @returns {Promise<Object>} Aggregated repository data
 */
async function aggregateRepository(octokit, repoString) {
  const { owner, repo } = parseRepo(repoString);

  console.log(`📊 Aggregating data for ${owner}/${repo}...`);

  try {
    const [metadata, commits, issues] = await Promise.all([
      fetchRepoMetadata(octokit, owner, repo),
      fetchRecentCommits(octokit, owner, repo, COMMITS_LIMIT),
      fetchOpenIssues(octokit, owner, repo, ISSUES_LIMIT),
    ]);

    console.log(`  ✅ Fetched: ${commits.length} commits, ${issues.length} issues`);

    return {
      repository: repoString,
      metadata,
      recentCommits: commits,
      openIssues: issues,
      aggregatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`  ❌ Failed to aggregate ${repoString}`);
    return {
      repository: repoString,
      error: error.message,
      aggregatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Ensure output directory exists
 */
function ensureOutputDirectory() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created output directory: ${OUTPUT_DIR}`);
  }
}

/**
 * Write aggregated data to JSON file
 * @param {Array} data - Array of aggregated repository data
 */
function writeOutputFile(data) {
  const output = {
    generatedAt: new Date().toISOString(),
    totalRepositories: data.length,
    successfulAggregations: data.filter((d) => !d.error).length,
    failedAggregations: data.filter((d) => d.error).length,
    repositories: data,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`\n✅ Successfully wrote aggregated data to: ${OUTPUT_FILE}`);
  console.log(`📊 Summary:`);
  console.log(`   Total repositories: ${output.totalRepositories}`);
  console.log(`   Successful: ${output.successfulAggregations}`);
  console.log(`   Failed: ${output.failedAggregations}`);
}

/**
 * Check GitHub API rate limit
 * @param {Octokit} octokit - Octokit client instance
 */
async function checkRateLimit(octokit) {
  try {
    const { data } = await octokit.rateLimit.get();
    const { remaining, limit, reset } = data.rate;
    const resetDate = new Date(reset * 1000);

    console.log(`\n⏱️  GitHub API Rate Limit:`);
    console.log(`   Remaining: ${remaining}/${limit}`);
    console.log(`   Resets at: ${resetDate.toLocaleString()}`);

    if (remaining < repos.length * 3) {
      console.warn(`\n⚠️  Warning: Low rate limit remaining!`);
      console.warn(`   You may not have enough requests to complete all aggregations.`);
      console.warn(`   Consider waiting until ${resetDate.toLocaleString()}`);
    }

    return { remaining, limit, reset };
  } catch (error) {
    console.error('❌ Error checking rate limit:', error.message);
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 GitHub Repository Aggregator\n');
  console.log(`📋 Repositories to aggregate: ${repos.length}`);
  console.log(`📝 Commits per repo: ${COMMITS_LIMIT}`);
  console.log(`📝 Issues per repo: ${ISSUES_LIMIT}\n`);

  // Initialize Octokit
  const octokit = initializeOctokit();

  // Check rate limit
  await checkRateLimit(octokit);

  // Ensure output directory exists
  ensureOutputDirectory();

  // Aggregate all repositories
  console.log('\n🔄 Starting aggregation...\n');
  const startTime = Date.now();

  const results = [];
  for (const repo of repos) {
    const result = await aggregateRepository(octokit, repo);
    results.push(result);

    // Small delay to avoid hitting rate limits too quickly
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Write results to file
  writeOutputFile(results);

  // Final rate limit check
  await checkRateLimit(octokit);

  console.log(`\n⏱️  Total execution time: ${duration}s`);
  console.log('✨ Aggregation complete!\n');
}

// Execute main function
if (require.main === module) {
  main().catch((error) => {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = {
  aggregateRepository,
  fetchRepoMetadata,
  fetchRecentCommits,
  fetchOpenIssues,
};

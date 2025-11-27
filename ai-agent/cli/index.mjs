#!/usr/bin/env node

/**
 * ISTANI AI Agent - CLI Interface
 * Command-line interface for managing the autonomous AI agent
 */

import { Command } from 'commander';
import IstaniAIAgent from '../core/agent.mjs';
import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const program = new Command();

// Load package.json for version
let version = '1.0.0';
try {
  const packageJson = JSON.parse(await readFile(join(__dirname, '../../package.json'), 'utf-8'));
  version = packageJson.version || version;
} catch (error) {
  // Ignore
}

program
  .name('istani-agent')
  .description('ISTANI Autonomous AI Agent - Ultra-secured PR automation')
  .version(version);

/**
 * Initialize agent from environment
 */
function initAgent() {
  return new IstaniAIAgent({
    owner: process.env.GITHUB_OWNER || 'sano1233',
    repo: process.env.GITHUB_REPO || 'istani',
  });
}

/**
 * Command: Process a specific PR
 */
program
  .command('process <prNumber>')
  .description('Process a specific pull request')
  .option('-v, --verbose', 'Verbose output')
  .action(async (prNumber, options) => {
    const spinner = ora(`Processing PR #${prNumber}`).start();

    try {
      const agent = initAgent();
      const result = await agent.processPullRequest(parseInt(prNumber));

      spinner.succeed(chalk.green(`PR #${prNumber} processed successfully`));

      console.log('\n' + chalk.bold('Results:'));
      console.log(chalk.cyan('Duration:'), result.duration + 's');
      console.log(chalk.cyan('Approved:'), result.review.approved ? '✅ Yes' : '❌ No');
      console.log(chalk.cyan('Build:'), result.buildResult.success ? '✅ Passed' : '❌ Failed');
      console.log(chalk.cyan('Tests:'), result.testResult.success ? '✅ Passed' : '❌ Failed');

      if (options.verbose) {
        console.log('\n' + chalk.bold('Review:'));
        console.log(result.review.text);
      }
    } catch (error) {
      spinner.fail(chalk.red(`Failed to process PR #${prNumber}`));
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

/**
 * Command: Process all open PRs
 */
program
  .command('process-all')
  .description('Process all open pull requests')
  .action(async () => {
    const spinner = ora('Fetching open PRs').start();

    try {
      const agent = initAgent();
      spinner.text = 'Processing all open PRs...';

      const results = await agent.processAllOpenPRs();

      spinner.succeed(chalk.green(`Processed ${results.length} PR(s)`));

      // Display results table
      const table = new Table({
        head: ['PR #', 'Status', 'Duration', 'Approved', 'Build', 'Tests'],
        style: { head: ['cyan'] },
      });

      results.forEach((result) => {
        if (result.success) {
          table.push([
            result.prNumber,
            '✅ Success',
            result.duration + 's',
            result.review.approved ? '✅' : '❌',
            result.buildResult.success ? '✅' : '❌',
            result.testResult.success ? '✅' : '❌',
          ]);
        } else {
          table.push([result.prNumber, '❌ Failed', '-', '-', '-', '-']);
        }
      });

      console.log('\n' + table.toString());
    } catch (error) {
      spinner.fail(chalk.red('Failed to process PRs'));
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

/**
 * Command: Show agent statistics
 */
program
  .command('stats')
  .description('Display agent statistics')
  .action(async () => {
    try {
      const agent = initAgent();
      const stats = agent.getStats();

      console.log(chalk.bold.cyan('\n📊 ISTANI AI Agent Statistics\n'));

      const table = new Table({
        style: { head: ['cyan'] },
      });

      table.push(
        ['PRs Processed', stats.prsProcessed],
        ['Builds Succeeded', chalk.green(stats.buildsSucceeded)],
        ['Builds Failed', chalk.red(stats.buildsFailed)],
        ['Deployments Succeeded', chalk.green(stats.deploymentsSucceeded)],
        ['Deployments Failed', chalk.red(stats.deploymentsFailed)],
        ['Security Issues Found', chalk.yellow(stats.securityIssuesFound)],
        ['Code Reviews Completed', stats.codeReviewsCompleted],
        ['Uptime', Math.floor(stats.uptime) + 's'],
        ['Timestamp', stats.timestamp],
      );

      console.log(table.toString() + '\n');
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

/**
 * Command: Review a PR
 */
program
  .command('review <prNumber>')
  .description('Perform code review only (no build/deploy)')
  .action(async (prNumber) => {
    const spinner = ora(`Reviewing PR #${prNumber}`).start();

    try {
      const agent = initAgent();
      const pr = await agent.fetchPRDetails(parseInt(prNumber));

      spinner.text = 'Analyzing changes...';
      const analysis = await agent.analyzePRChanges(pr);

      spinner.text = 'Performing code review...';
      const review = await agent.performCodeReview(pr, analysis);

      spinner.succeed(chalk.green('Code review completed'));

      console.log('\n' + chalk.bold('Review Results:'));
      console.log(chalk.cyan('Status:'), review.approved ? '✅ Approved' : '⚠️ Changes Requested');
      console.log(chalk.cyan('Reviewer:'), review.reviewer);
      console.log(chalk.cyan('Timestamp:'), review.timestamp);

      console.log('\n' + chalk.bold('Review:'));
      console.log(review.text);
    } catch (error) {
      spinner.fail(chalk.red(`Failed to review PR #${prNumber}`));
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

/**
 * Command: Security scan
 */
program
  .command('scan <prNumber>')
  .description('Run security scan on a PR')
  .action(async (prNumber) => {
    const spinner = ora(`Scanning PR #${prNumber} for security issues`).start();

    try {
      const agent = initAgent();
      const pr = await agent.fetchPRDetails(parseInt(prNumber));

      const result = await agent.securityScan(pr);

      if (result.passed) {
        spinner.succeed(chalk.green('No security issues found'));
      } else {
        spinner.warn(chalk.yellow(`Found ${result.issues.length} security issue(s)`));

        const table = new Table({
          head: ['Severity', 'File', 'Issue'],
          style: { head: ['cyan'] },
        });

        result.issues.forEach((issue) => {
          const severityColor =
            {
              HIGH: chalk.red,
              MEDIUM: chalk.yellow,
              LOW: chalk.blue,
            }[issue.severity] || chalk.white;

          table.push([severityColor(issue.severity), issue.file, issue.issue]);
        });

        console.log('\n' + table.toString());
      }
    } catch (error) {
      spinner.fail(chalk.red(`Security scan failed`));
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

/**
 * Command: Deploy
 */
program
  .command('deploy')
  .description('Deploy to production')
  .option('-v, --vercel', 'Deploy to Vercel only')
  .option('-n, --netlify', 'Deploy to Netlify only')
  .action(async (options) => {
    const spinner = ora('Deploying to production').start();

    try {
      const agent = initAgent();

      // Create a mock PR object for deployment
      const mockPR = { number: 'manual' };

      await agent.deployToProduction(mockPR);

      spinner.succeed(chalk.green('Deployment successful'));
    } catch (error) {
      spinner.fail(chalk.red('Deployment failed'));
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

/**
 * Command: Run pre-merge checks
 */
program
  .command('pre-merge-checks <prNumber>')
  .alias('checks')
  .description('Run pre-merge checks on a PR')
  .action(async (prNumber) => {
    const spinner = ora(`Running pre-merge checks on PR #${prNumber}`).start();

    try {
      const agent = initAgent();
      const pr = await agent.fetchPRDetails(parseInt(prNumber));
      const analysis = await agent.analyzePRChanges(pr);

      spinner.text = 'Running checks...';
      const results = await agent.runPreMergeChecks(pr, { analysis });

      spinner.succeed(chalk.green('Pre-merge checks completed'));

      // Display results
      if (results.failed.length > 0) {
        console.log('\n' + chalk.bold.red('❌ Failed Checks:'));
        const table = new Table({
          head: ['Check', 'Status', 'Explanation', 'Resolution'],
          style: { head: ['red'] },
        });

        results.failed.forEach((check) => {
          const status =
            check.mode === 'error' ? chalk.red('❌ Error') : chalk.yellow('⚠️ Warning');
          table.push([check.name, status, check.explanation || '', check.resolution || 'N/A']);
        });

        console.log(table.toString());
      }

      if (results.passed.length > 0) {
        console.log('\n' + chalk.bold.green('✅ Passed Checks:'));
        results.passed.forEach((check) => {
          console.log(chalk.green(`  ✓ ${check.name}: ${check.explanation || ''}`));
        });
      }

      if (results.inconclusive.length > 0) {
        console.log('\n' + chalk.bold.yellow('❓ Inconclusive Checks:'));
        results.inconclusive.forEach((check) => {
          console.log(chalk.yellow(`  ? ${check.name}: ${check.explanation || ''}`));
        });
      }

      // Summary
      const total = results.failed.length + results.passed.length + results.inconclusive.length;
      const errorCount = results.failed.filter((c) => c.mode === 'error').length;
      const blocked = errorCount > 0;

      console.log('\n' + chalk.bold('Summary:'));
      console.log(`  Total: ${total}`);
      console.log(`  Passed: ${chalk.green(results.passed.length)}`);
      console.log(`  Failed: ${chalk.red(results.failed.length)}`);
      console.log(`  Inconclusive: ${chalk.yellow(results.inconclusive.length)}`);

      if (blocked) {
        console.log('\n' + chalk.red('⚠️  PR is blocked by error-level checks'));
        process.exit(1);
      }
    } catch (error) {
      spinner.fail(chalk.red(`Failed to run pre-merge checks`));
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

/**
 * Command: Evaluate custom check
 */
program
  .command('evaluate-check <prNumber>')
  .description('Evaluate a custom pre-merge check')
  .requiredOption('-n, --name <name>', 'Check name')
  .requiredOption('-i, --instructions <instructions>', 'Check instructions')
  .option('-m, --mode <mode>', 'Enforcement mode (error|warning)', 'warning')
  .action(async (prNumber, options) => {
    const spinner = ora(`Evaluating custom check on PR #${prNumber}`).start();

    try {
      const agent = initAgent();
      spinner.text = 'Running custom check...';

      const result = await agent.evaluateCustomCheck(
        options.name,
        options.instructions,
        parseInt(prNumber),
        options.mode,
      );

      spinner.succeed(chalk.green('Custom check evaluation completed'));

      console.log('\n' + chalk.bold('Result:'));
      console.log(chalk.cyan('Name:'), result.name);
      console.log(
        chalk.cyan('Status:'),
        result.status === 'passed'
          ? chalk.green('✅ Passed')
          : result.status === 'failed'
            ? chalk.red('❌ Failed')
            : chalk.yellow('❓ Inconclusive'),
      );
      console.log(chalk.cyan('Mode:'), result.mode);
      console.log(chalk.cyan('Explanation:'), result.explanation || 'N/A');
      if (result.resolution) {
        console.log(chalk.cyan('Resolution:'), result.resolution);
      }
    } catch (error) {
      spinner.fail(chalk.red(`Failed to evaluate custom check`));
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

/**
 * Command: Ignore failed checks
 */
program
  .command('ignore-checks <prNumber>')
  .description('Ignore failed pre-merge checks for a PR')
  .action(async (prNumber) => {
    const spinner = ora(`Ignoring failed checks for PR #${prNumber}`).start();

    try {
      const agent = initAgent();
      const result = await agent.ignorePreMergeChecks(parseInt(prNumber));

      spinner.succeed(chalk.green(result.message));
      console.log(chalk.yellow('\n⚠️  Note: This override applies only to this PR.'));
    } catch (error) {
      spinner.fail(chalk.red(`Failed to ignore checks`));
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

/**
 * Command: Config check
 */
program
  .command('config')
  .description('Check agent configuration')
  .action(() => {
    console.log(chalk.bold.cyan('\n🔧 Agent Configuration\n'));

    const config = {
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Not set',
      GITHUB_TOKEN: process.env.GITHUB_TOKEN ? '✅ Set' : '❌ Not set',
      GITHUB_OWNER: process.env.GITHUB_OWNER || 'sano1233 (default)',
      GITHUB_REPO: process.env.GITHUB_REPO || 'istani (default)',
      VERCEL_TOKEN: process.env.VERCEL_TOKEN ? '✅ Set' : '❌ Not set',
      NETLIFY_TOKEN: process.env.NETLIFY_TOKEN ? '✅ Set' : '❌ Not set',
      GITHUB_WEBHOOK_SECRET: process.env.GITHUB_WEBHOOK_SECRET ? '✅ Set' : '❌ Not set',
    };

    const table = new Table({
      style: { head: ['cyan'] },
    });

    Object.entries(config).forEach(([key, value]) => {
      table.push([key, value]);
    });

    console.log(table.toString() + '\n');

    const missing = Object.entries(config).filter(([k, v]) => v.includes('❌'));
    if (missing.length > 0) {
      console.log(chalk.yellow('⚠️ Missing required environment variables:'));
      missing.forEach(([key]) => console.log(chalk.yellow(`  - ${key}`)));
      console.log('\n' + chalk.cyan('See documentation for setup instructions.\n'));
    }
  });

/**
 * Parse and execute
 */
program.parse();

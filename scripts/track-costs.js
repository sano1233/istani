#!/usr/bin/env node

/**
 * ISTANI Cost Tracking Script
 * Tracks and reports on cloud service costs
 * Run daily via cron: 0 9 * * * node scripts/track-costs.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Budget allocation ($147/month)
const BUDGET = {
  total: 147,
  services: {
    vercel: 20,
    supabase: 25,
    railway: 30,
    openai: 30,
    cloudflare: 0,
    sentry: 26,
    uptimeRobot: 0,
    betterStack: 0,
    reserve: 16,
  },
};

// Track costs
const costs = {
  date: new Date().toISOString().split('T')[0],
  services: {},
  total: 0,
  percentOfBudget: 0,
  alerts: [],
};

/**
 * Fetch Vercel usage (requires API token)
 */
async function getVercelUsage() {
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    return { estimated: BUDGET.services.vercel, note: 'Pro plan - fixed cost' };
  }

  // Note: Vercel Pro is a fixed $20/month, no usage-based billing
  return { estimated: 20, note: 'Pro plan - fixed cost' };
}

/**
 * Fetch Supabase usage (requires API key)
 */
async function getSupabaseUsage() {
  // Note: Supabase Pro is a fixed $25/month for the base tier
  // Additional costs for compute/storage are tracked separately
  return { estimated: 25, note: 'Pro plan - base cost' };
}

/**
 * Fetch Railway usage (requires API token)
 */
async function getRailwayUsage() {
  const token = process.env.RAILWAY_TOKEN;
  if (!token) {
    return { estimated: 30, note: 'Estimated monthly cost' };
  }

  // Railway charges based on resource usage
  // This would require calling Railway API to get current usage
  return { estimated: 30, note: 'Standard deployment - estimated' };
}

/**
 * Estimate OpenAI costs based on token usage
 */
async function getOpenAIUsage() {
  // OpenAI pricing (as of 2024):
  // GPT-4 Turbo: $10/1M input tokens, $30/1M output tokens
  // GPT-3.5 Turbo: $0.50/1M input tokens, $1.50/1M output tokens

  const PRICING = {
    'gpt-4-turbo': { input: 10 / 1_000_000, output: 30 / 1_000_000 },
    'gpt-3.5-turbo': { input: 0.5 / 1_000_000, output: 1.5 / 1_000_000 },
  };

  // This would require tracking token usage in your application
  // For now, we'll estimate based on budget allocation
  return {
    estimated: 30,
    note: 'Budget allocation - monitor actual usage',
    breakdown: {
      'meal-planning': 10,
      'workout-generation': 10,
      'coaching-messages': 10,
    },
  };
}

/**
 * Fetch Sentry usage
 */
async function getSentryUsage() {
  // Developer plan is $26/month fixed
  return { estimated: 26, note: 'Developer plan - fixed cost' };
}

/**
 * Calculate total costs
 */
async function calculateCosts() {
  console.log('📊 ISTANI Cost Tracking Report');
  console.log('================================\n');

  // Fetch all service costs
  costs.services.vercel = await getVercelUsage();
  costs.services.supabase = await getSupabaseUsage();
  costs.services.railway = await getRailwayUsage();
  costs.services.openai = await getOpenAIUsage();
  costs.services.sentry = await getSentryUsage();
  costs.services.cloudflare = { estimated: 0, note: 'Free plan' };
  costs.services.uptimeRobot = { estimated: 0, note: 'Free plan' };
  costs.services.betterStack = { estimated: 0, note: 'Free plan' };

  // Calculate total
  costs.total = Object.values(costs.services).reduce(
    (sum, service) => sum + (service.estimated || 0),
    0,
  );

  costs.percentOfBudget = (costs.total / BUDGET.total) * 100;

  // Check for alerts
  if (costs.percentOfBudget > 100) {
    costs.alerts.push({
      level: 'CRITICAL',
      message: `Budget exceeded: $${costs.total} / $${BUDGET.total} (${costs.percentOfBudget.toFixed(1)}%)`,
    });
  } else if (costs.percentOfBudget > 90) {
    costs.alerts.push({
      level: 'WARNING',
      message: `Approaching budget limit: ${costs.percentOfBudget.toFixed(1)}% used`,
    });
  }

  // Check individual services
  Object.entries(costs.services).forEach(([service, data]) => {
    const budgeted = BUDGET.services[service] || 0;
    const actual = data.estimated || 0;

    if (actual > budgeted) {
      costs.alerts.push({
        level: 'WARNING',
        message: `${service}: $${actual} exceeds budget of $${budgeted}`,
      });
    }
  });
}

/**
 * Print report
 */
function printReport() {
  console.log('Date:', costs.date);
  console.log('\nService Costs:');
  console.log('─'.repeat(60));

  Object.entries(costs.services).forEach(([service, data]) => {
    const budgeted = BUDGET.services[service] || 0;
    const actual = data.estimated || 0;
    const status = actual <= budgeted ? '✓' : '⚠';

    console.log(
      `${status} ${service.padEnd(15)} $${actual.toFixed(2).padStart(6)} / $${budgeted.toFixed(2).padStart(6)} | ${data.note}`,
    );
  });

  console.log('─'.repeat(60));
  console.log(
    `TOTAL:              $${costs.total.toFixed(2).padStart(6)} / $${BUDGET.total.toFixed(2).padStart(6)} (${costs.percentOfBudget.toFixed(1)}%)`,
  );
  console.log('─'.repeat(60));

  if (costs.alerts.length > 0) {
    console.log('\n⚠ Alerts:');
    costs.alerts.forEach((alert) => {
      console.log(`  [${alert.level}] ${alert.message}`);
    });
  } else {
    console.log('\n✓ All services within budget');
  }

  console.log('\n');
}

/**
 * Save report to file
 */
function saveReport() {
  const reportsDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const filename = `cost-report-${costs.date}.json`;
  const filepath = path.join(reportsDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(costs, null, 2));
  console.log(`💾 Report saved to: ${filepath}\n`);
}

/**
 * Send alerts (if needed)
 */
async function sendAlerts() {
  if (costs.alerts.length === 0) return;

  const criticalAlerts = costs.alerts.filter((a) => a.level === 'CRITICAL');

  if (criticalAlerts.length > 0) {
    console.log('🚨 Critical alerts detected!');
    console.log('Consider reducing usage or optimizing costs.\n');

    // Here you could send email/Slack notifications
    // Example: await sendSlackNotification(costs);
  }
}

/**
 * Generate monthly summary
 */
function generateMonthlySummary() {
  const reportsDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportsDir)) return;

  const files = fs.readdirSync(reportsDir).filter((f) => f.startsWith('cost-report-'));

  if (files.length === 0) return;

  console.log('📈 Monthly Summary:');
  console.log('─'.repeat(60));

  let totalCost = 0;
  let count = 0;

  files.forEach((file) => {
    const data = JSON.parse(fs.readFileSync(path.join(reportsDir, file), 'utf8'));
    totalCost += data.total;
    count++;
  });

  const avgDaily = totalCost / count;
  const projectedMonthly = avgDaily * 30;

  console.log(`Reports analyzed: ${count}`);
  console.log(`Average daily cost: $${avgDaily.toFixed(2)}`);
  console.log(`Projected monthly cost: $${projectedMonthly.toFixed(2)}`);
  console.log(`Budget: $${BUDGET.total}`);
  console.log(`Projection vs Budget: ${((projectedMonthly / BUDGET.total) * 100).toFixed(1)}%`);
  console.log('─'.repeat(60));
  console.log('\n');
}

/**
 * Main execution
 */
async function main() {
  try {
    await calculateCosts();
    printReport();
    saveReport();
    await sendAlerts();
    generateMonthlySummary();

    // Exit with error code if budget exceeded
    if (costs.percentOfBudget > 100) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Error tracking costs:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { calculateCosts, BUDGET };

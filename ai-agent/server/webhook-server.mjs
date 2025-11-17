/**
 * ISTANI AI Agent - Webhook Server
 * Receives GitHub webhook events and triggers autonomous agent
 */

import express from 'express';
import bodyParser from 'body-parser';
import IstaniAIAgent from '../core/agent.mjs';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3001;
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

// Initialize AI Agent
const agent = new IstaniAIAgent({
  owner: process.env.GITHUB_OWNER || 'sano1233',
  repo: process.env.GITHUB_REPO || 'istani',
});

// Middleware
app.use(bodyParser.json());

/**
 * Verify GitHub webhook signature
 */
function verifySignature(req, res, next) {
  if (!WEBHOOK_SECRET) {
    console.warn('⚠️ GITHUB_WEBHOOK_SECRET not set - skipping signature verification');
    return next();
  }

  const signature = req.headers['x-hub-signature-256'];
  if (!signature) {
    return res.status(401).json({ error: 'Missing signature' });
  }

  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  next();
}

/**
 * GitHub webhook endpoint
 */
app.post('/webhook', verifySignature, async (req, res) => {
  const event = req.headers['x-github-event'];
  const payload = req.body;

  console.log(`📥 Received ${event} event`);

  // Respond quickly to GitHub
  res.status(200).json({ status: 'received' });

  // Process asynchronously
  processWebhookEvent(event, payload).catch((error) => {
    console.error(`❌ Error processing webhook:`, error);
  });
});

/**
 * Process webhook events
 */
async function processWebhookEvent(event, payload) {
  try {
    switch (event) {
      case 'pull_request':
        await handlePullRequestEvent(payload);
        break;

      case 'pull_request_review':
        await handlePullRequestReviewEvent(payload);
        break;

      case 'push':
        await handlePushEvent(payload);
        break;

      case 'issue_comment':
        await handleIssueCommentEvent(payload);
        break;

      case 'workflow_run':
        await handleWorkflowRunEvent(payload);
        break;

      default:
        console.log(`ℹ️ Ignoring ${event} event`);
    }
  } catch (error) {
    console.error(`❌ Error handling ${event}:`, error);
  }
}

/**
 * Handle pull_request events
 */
async function handlePullRequestEvent(payload) {
  const action = payload.action;
  const pr = payload.pull_request;

  console.log(`🔔 PR #${pr.number}: ${action} - "${pr.title}"`);

  // Trigger agent on: opened, synchronize (new commits), reopened
  if (['opened', 'synchronize', 'reopened'].includes(action)) {
    console.log(`🤖 Triggering AI agent for PR #${pr.number}`);

    try {
      await agent.processPullRequest(pr.number);
    } catch (error) {
      console.error(`❌ Agent failed for PR #${pr.number}:`, error);
    }
  }
}

/**
 * Handle pull_request_review events
 */
async function handlePullRequestReviewEvent(payload) {
  const action = payload.action;
  const review = payload.review;
  const pr = payload.pull_request;

  console.log(`👀 Review ${action} on PR #${pr.number} by @${review.user.login}`);

  // Could trigger additional checks based on reviews
  if (action === 'submitted' && review.state === 'approved') {
    console.log(`✅ PR #${pr.number} approved by @${review.user.login}`);
    // Optional: trigger deployment
  }
}

/**
 * Handle push events
 */
async function handlePushEvent(payload) {
  const ref = payload.ref;
  const commits = payload.commits;

  console.log(`📤 Push to ${ref} with ${commits.length} commit(s)`);

  // Trigger deployment on main branch pushes
  if (ref === 'refs/heads/main' && agent.config.autoDeploy) {
    console.log(`🚀 Triggering deployment for main branch`);
    // Could trigger deployment here
  }
}

/**
 * Handle issue_comment events
 */
async function handleIssueCommentEvent(payload) {
  const action = payload.action;
  const comment = payload.comment;
  const issue = payload.issue;

  console.log(`💬 Comment ${action} on issue #${issue.number}`);

  // Check for bot commands
  if (action === 'created' && comment.body) {
    const body = comment.body.toLowerCase().trim();

    // Command: /review
    if (body === '/review' && issue.pull_request) {
      console.log(`🤖 Manual review requested for PR #${issue.number}`);
      const prNumber = issue.number;
      await agent.processPullRequest(prNumber);
    }

    // Command: /deploy
    if (body === '/deploy' && issue.pull_request) {
      console.log(`🚀 Manual deployment requested for PR #${issue.number}`);
      // Trigger deployment
    }

    // Command: /stats
    if (body === '/stats') {
      const stats = agent.getStats();
      console.log(`📊 Stats requested:`, stats);
      // Could post stats as comment
    }
  }
}

/**
 * Handle workflow_run events
 */
async function handleWorkflowRunEvent(payload) {
  const workflow = payload.workflow_run;
  const status = workflow.status;
  const conclusion = workflow.conclusion;

  console.log(`⚙️ Workflow "${workflow.name}" ${status}${conclusion ? ` (${conclusion})` : ''}`);
}

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  const stats = agent.getStats();
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    agent: stats,
  });
});

/**
 * Stats endpoint
 */
app.get('/stats', (req, res) => {
  res.json(agent.getStats());
});

/**
 * Trigger manual PR processing
 */
app.post('/process/:prNumber', async (req, res) => {
  const prNumber = parseInt(req.params.prNumber);

  if (isNaN(prNumber)) {
    return res.status(400).json({ error: 'Invalid PR number' });
  }

  console.log(`🤖 Manual trigger for PR #${prNumber}`);

  try {
    const result = await agent.processPullRequest(prNumber);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Process all open PRs
 */
app.post('/process-all', async (req, res) => {
  console.log(`🤖 Processing all open PRs`);

  // Respond immediately
  res.json({ status: 'processing' });

  // Process in background
  try {
    await agent.processAllOpenPRs();
  } catch (error) {
    console.error(`❌ Error processing all PRs:`, error);
  }
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`🚀 ISTANI AI Agent Webhook Server running on port ${PORT}`);
  console.log(`📡 Ready to receive GitHub webhooks`);
  console.log(`🤖 Agent initialized and ready`);
  console.log(`\nEndpoints:`);
  console.log(`  POST /webhook - GitHub webhook receiver`);
  console.log(`  GET  /health - Health check`);
  console.log(`  GET  /stats - Agent statistics`);
  console.log(`  POST /process/:prNumber - Manually process a PR`);
  console.log(`  POST /process-all - Process all open PRs`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;

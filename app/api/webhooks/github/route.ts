import { NextRequest, NextResponse } from 'next/server';
import { agent } from '@/lib/autonomous/agent';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Verify GitHub webhook signature
 */
function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) return false;

  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(body).digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

/**
 * GitHub webhook handler for autonomous PR processing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256');

    // Verify webhook signature
    if (!signature || !verifySignature(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = request.headers.get('x-github-event');
    const payload = JSON.parse(body);

    console.log(`📨 Received GitHub webhook: ${event}`);

    // Handle pull request events
    if (event === 'pull_request') {
      const action = payload.action;
      const pr = payload.pull_request;

      if (action === 'opened' || action === 'synchronize') {
        // Auto-analyze the PR
        console.log(`🤖 Auto-analyzing PR #${pr.number}...`);

        const analysis = await agent.analyzePullRequest({
          title: pr.title,
          body: pr.body || '',
          files: await fetchPRFiles(pr.number, payload.repository.full_name),
        });

        // Auto-merge if approved
        if (analysis.approved && analysis.confidence >= 0.85) {
          const mergeResult = await agent.autoMerge({
            number: pr.number,
            analysis,
          });

          console.log(
            `✅ PR #${pr.number} ${mergeResult.merged ? 'merged' : 'awaiting review'}: ${mergeResult.reason}`
          );

          return NextResponse.json({
            success: true,
            action: mergeResult.merged ? 'merged' : 'analyzed',
            analysis,
            merge: mergeResult,
          });
        }

        return NextResponse.json({
          success: true,
          action: 'analyzed',
          analysis,
        });
      }
    }

    // Handle issue events
    if (event === 'issues') {
      const action = payload.action;
      const issue = payload.issue;

      if (action === 'opened' && issue.labels.some((l: any) => l.name === 'bug')) {
        console.log(`🤖 Auto-resolving issue #${issue.number}...`);

        const resolution = await agent.autoResolve({
          title: issue.title,
          description: issue.body || '',
        });

        return NextResponse.json({
          success: true,
          action: 'resolved',
          resolution,
        });
      }
    }

    return NextResponse.json({ success: true, action: 'acknowledged' });
  } catch (error: any) {
    console.error('GitHub webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Fetch PR files from GitHub API
 */
async function fetchPRFiles(
  prNumber: number,
  repo: string
): Promise<Array<{ filename: string; changes: string }>> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return [];

  try {
    const response = await fetch(
      `https://api.github.com/repos/${repo}/pulls/${prNumber}/files`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) return [];

    const files = await response.json();

    return files.map((file: any) => ({
      filename: file.filename,
      changes: file.patch || '',
    }));
  } catch (error) {
    console.error('Failed to fetch PR files:', error);
    return [];
  }
}

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-hub-signature-256');
    const event = request.headers.get('x-github-event');
    const deliveryId = request.headers.get('x-github-delivery');
    
    if (!signature || !event) {
      return NextResponse.json(
        { error: 'Missing required headers' },
        { status: 400 }
      );
    }

    const body = await request.text();
    const secret = process.env.GITHUB_WEBHOOK_SECRET || '';

    // Verify signature
    if (secret) {
      const hmac = crypto.createHmac('sha256', secret);
      const digest = 'sha256=' + hmac.update(body).digest('hex');
      
      if (signature !== digest) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    const payload = JSON.parse(body);

    // Handle different GitHub events
    switch (event) {
      case 'pull_request':
        await handlePullRequest(payload);
        break;
      case 'push':
        await handlePush(payload);
        break;
      case 'pull_request_review':
        await handlePRReview(payload);
        break;
      case 'check_run':
        await handleCheckRun(payload);
        break;
      default:
        console.log(`Unhandled event: ${event}`);
    }

    return NextResponse.json({ 
      success: true, 
      event,
      deliveryId 
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function handlePullRequest(payload: any) {
  const { action, pull_request, repository } = payload;
  
  console.log(`PR ${action}: #${pull_request.number} - ${pull_request.title}`);
  
  // Trigger auto-fix if PR is opened or updated
  if (action === 'opened' || action === 'synchronize') {
    // This would trigger the GitHub Actions workflow
    // or call the auto-fix system directly
    console.log('Triggering auto-fix for PR...');
  }
  
  // Auto-merge if conditions are met
  if (action === 'ready_for_review' && pull_request.mergeable) {
    console.log('PR ready for review, checking auto-merge conditions...');
  }
}

async function handlePush(payload: any) {
  const { ref, commits, repository } = payload;
  
  console.log(`Push to ${ref} with ${commits.length} commit(s)`);
  
  // Trigger deployment if push is to main/master
  if (ref === 'refs/heads/main' || ref === 'refs/heads/master') {
    console.log('Triggering deployment...');
    // Trigger deployment workflow
  }
}

async function handlePRReview(payload: any) {
  const { action, review, pull_request } = payload;
  
  if (action === 'submitted' && review.state === 'approved') {
    console.log(`PR #${pull_request.number} approved, checking auto-merge...`);
    // Check if PR can be auto-merged
  }
}

async function handleCheckRun(payload: any) {
  const { action, check_run } = payload;
  
  if (action === 'completed' && check_run.conclusion === 'success') {
    console.log(`Check run ${check_run.name} completed successfully`);
    // Check if all checks passed and trigger auto-merge
  }
}

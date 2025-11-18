import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * N8N Webhook Endpoint
 * Receives events from N8N workflows and processes them
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventType = body.event || body.type;
    const supabase = await createClient();

    // Log the event
    await supabase.from('n8n_events').insert({
      event_type: eventType,
      payload: body,
      received_at: new Date().toISOString()
    });

    // Handle different event types
    switch (eventType) {
      case 'repository.sync':
        await handleRepositorySync(body, supabase);
        break;
      
      case 'auto-fix.trigger':
        await handleAutoFixTrigger(body, supabase);
        break;
      
      case 'deployment.request':
        await handleDeploymentRequest(body, supabase);
        break;
      
      default:
        console.log(`Unhandled N8N event: ${eventType}`);
    }

    return NextResponse.json({ 
      success: true, 
      event: eventType,
      processed_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('N8N webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleRepositorySync(data: any, supabase: any) {
  // Trigger repository sync
  const { repo, branch, commit } = data;
  console.log(`Syncing repository: ${repo} (${branch}) - ${commit}`);
  
  // This would trigger the sync workflow
  // Implementation depends on your setup
}

async function handleAutoFixTrigger(data: any, supabase: any) {
  // Trigger auto-fix for a repository
  const { repo, pr_number, files } = data;
  console.log(`Auto-fixing PR #${pr_number} in ${repo}`);
  
  // This would trigger the auto-fix workflow
}

async function handleDeploymentRequest(data: any, supabase: any) {
  // Handle deployment request
  const { repo, environment, version } = data;
  console.log(`Deploying ${repo} v${version} to ${environment}`);
  
  // This would trigger deployment
}

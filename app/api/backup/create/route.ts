import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/backup/create
 * Create a full or incremental backup
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, backup_type = 'full', since } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const timestamp = new Date().toISOString();

    // Build data object
    const backupData: any = {
      version: '1.0',
      timestamp,
      user_id,
      backup_type,
      data: {},
      metadata: {
        total_size: 0,
        record_counts: {},
        created_by: user_id,
      },
    };

    // Fetch all user data
    const tables = [
      'profiles',
      'workouts',
      'meals',
      'body_measurements',
      'user_achievements',
      'friends',
      'challenge_participants',
      'user_settings',
      'workout_plans',
      'recipes',
      'meal_plans',
    ];

    for (const table of tables) {
      try {
        let query = supabase.from(table).select('*');

        // For incremental backups, only get records updated since timestamp
        if (backup_type === 'incremental' && since) {
          query = query.gte('updated_at', since);
        }

        // Filter by user_id for user-specific tables
        if (table !== 'profiles') {
          query = query.eq('user_id', user_id);
        } else {
          query = query.eq('id', user_id);
        }

        const { data, error } = await query;

        if (!error && data) {
          backupData.data[table] = data;
          backupData.metadata.record_counts[table] = data.length;
        }
      } catch (error) {
        console.error(`Error fetching ${table}:`, error);
      }
    }

    // Calculate total size
    const dataStr = JSON.stringify(backupData.data);
    backupData.metadata.total_size = new Blob([dataStr]).size;

    // Calculate checksum
    const checksum = await calculateChecksum(dataStr);
    backupData.metadata.checksum = checksum;

    // Store backup record
    await supabase.from('backup_history').insert({
      user_id,
      backup_type,
      timestamp,
      size: backupData.metadata.total_size,
      status: 'completed',
      metadata: backupData.metadata,
    });

    return NextResponse.json(backupData);
  } catch (error) {
    console.error('Error creating backup:', error);
    return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 });
  }
}

async function calculateChecksum(data: string): Promise<string> {
  // Simple hash for Node.js environment
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

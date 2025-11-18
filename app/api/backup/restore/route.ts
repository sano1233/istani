import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/backup/restore
 * Restore user data from a backup
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, backup_data } = body;

    if (!user_id || !backup_data) {
      return NextResponse.json(
        { error: 'user_id and backup_data are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Validate backup structure
    if (!backup_data.data || typeof backup_data.data !== 'object') {
      return NextResponse.json({ error: 'Invalid backup format' }, { status: 400 });
    }

    // Restore data for each table
    const results: Record<string, { success: boolean; count: number }> = {};

    for (const [table, records] of Object.entries(backup_data.data)) {
      if (!Array.isArray(records) || records.length === 0) {
        results[table] = { success: true, count: 0 };
        continue;
      }

      try {
        // For profiles, use upsert
        if (table === 'profiles') {
          const { error } = await supabase.from(table).upsert(records);
          results[table] = { success: !error, count: records.length };
        } else {
          // For other tables, delete existing records first
          await supabase.from(table).delete().eq('user_id', user_id);

          // Then insert backup records
          const { error } = await supabase.from(table).insert(records);
          results[table] = { success: !error, count: records.length };
        }
      } catch (error) {
        console.error(`Error restoring ${table}:`, error);
        results[table] = { success: false, count: 0 };
      }
    }

    // Log restoration
    await supabase.from('backup_history').insert({
      user_id,
      backup_type: 'restore',
      timestamp: new Date().toISOString(),
      size: backup_data.metadata?.total_size || 0,
      status: 'completed',
      metadata: { restoration_results: results },
    });

    return NextResponse.json({
      success: true,
      results,
      message: 'Backup restored successfully',
    });
  } catch (error) {
    console.error('Error restoring backup:', error);
    return NextResponse.json({ error: 'Failed to restore backup' }, { status: 500 });
  }
}

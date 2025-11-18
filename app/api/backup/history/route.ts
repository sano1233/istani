import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/backup/history
 * Get backup history for a user
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('backup_history')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching backup history:', error);
      return NextResponse.json({ error: 'Failed to fetch backup history' }, { status: 500 });
    }

    return NextResponse.json({ backups: data || [] });
  } catch (error) {
    console.error('Error in backup history API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

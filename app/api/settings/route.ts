import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/settings
 * Get user settings
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
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = not found
      console.error('Error fetching settings:', error);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    return NextResponse.json(data || null);
  } catch (error) {
    console.error('Error in settings GET API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/settings
 * Update user settings
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, section, updates } = body;

    if (!user_id || !section || !updates) {
      return NextResponse.json(
        { error: 'user_id, section, and updates are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get existing settings
    const { data: existingSettings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user_id)
      .single();

    const newSettings = existingSettings
      ? {
          ...existingSettings,
          [section]: {
            ...existingSettings[section],
            ...updates,
          },
          updated_at: new Date().toISOString(),
        }
      : {
          user_id,
          [section]: updates,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

    const { error } = await supabase
      .from('user_settings')
      .upsert(newSettings);

    if (error) {
      console.error('Error updating settings:', error);
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in settings PUT API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

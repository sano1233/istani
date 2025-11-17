import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * Get daily micronutrient intake
 * GET /api/nutrition/micronutrients?date=2025-01-15
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('micronutrient_intake')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({
      success: true,
      date,
      data: data || null,
    });
  } catch (error: any) {
    console.error('Micronutrients API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch micronutrients' },
      { status: 500 }
    );
  }
}

/**
 * Save/update daily micronutrient intake
 * POST /api/nutrition/micronutrients
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { date = new Date().toISOString().split('T')[0], nutrients } = body;

    if (!nutrients) {
      return NextResponse.json(
        { error: 'Nutrients data is required' },
        { status: 400 }
      );
    }

    // Check if record exists for this date
    const { data: existing } = await supabase
      .from('micronutrient_intake')
      .select('id')
      .eq('user_id', user.id)
      .eq('date', date)
      .single();

    let result;

    if (existing) {
      // Update existing record
      result = await supabase
        .from('micronutrient_intake')
        .update({
          ...nutrients,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('date', date)
        .select()
        .single();
    } else {
      // Insert new record
      result = await supabase
        .from('micronutrient_intake')
        .insert({
          user_id: user.id,
          date,
          ...nutrients,
        })
        .select()
        .single();
    }

    if (result.error) throw result.error;

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error: any) {
    console.error('Save micronutrients API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save micronutrients' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      full_name,
      email,
      age,
      sex,
      height_cm,
      weight_kg,
      body_fat_percentage,
      primary_goal,
      target_date,
    } = body;

    // Validate required fields
    if (!full_name || !email) {
      return NextResponse.json(
        { error: 'Full name and email are required' },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (age && (isNaN(age) || age < 13 || age > 120)) {
      return NextResponse.json(
        { error: 'Age must be between 13 and 120' },
        { status: 400 }
      );
    }

    if (height_cm && (isNaN(height_cm) || height_cm < 50 || height_cm > 300)) {
      return NextResponse.json(
        { error: 'Height must be between 50cm and 300cm' },
        { status: 400 }
      );
    }

    if (weight_kg && (isNaN(weight_kg) || weight_kg < 20 || weight_kg > 500)) {
      return NextResponse.json(
        { error: 'Weight must be between 20kg and 500kg' },
        { status: 400 }
      );
    }

    if (
      body_fat_percentage &&
      (isNaN(body_fat_percentage) || body_fat_percentage < 3 || body_fat_percentage > 60)
    ) {
      return NextResponse.json(
        { error: 'Body fat percentage must be between 3% and 60%' },
        { status: 400 }
      );
    }

    // Update email if changed
    if (email !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email,
      });

      if (emailError) {
        return NextResponse.json(
          { error: 'Failed to update email: ' + emailError.message },
          { status: 400 }
        );
      }
    }

    // Update profile
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name,
        email,
        age: age ? parseInt(age) : null,
        sex: sex || null,
        height_cm: height_cm ? parseFloat(height_cm) : null,
        weight_kg: weight_kg ? parseFloat(weight_kg) : null,
        body_fat_percentage: body_fat_percentage ? parseFloat(body_fat_percentage) : null,
        primary_goal: primary_goal || null,
        target_date: target_date || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return NextResponse.json(
        { error: 'Failed to update profile: ' + error.message },
        { status: 500 }
      );
    }

    // If weight changed, create a new body measurement entry
    if (weight_kg && weight_kg !== data.weight_kg) {
      await supabase.from('body_measurements').insert({
        user_id: user.id,
        weight_kg: parseFloat(weight_kg),
        body_fat_percentage: body_fat_percentage ? parseFloat(body_fat_percentage) : null,
        measured_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data,
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update profile',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

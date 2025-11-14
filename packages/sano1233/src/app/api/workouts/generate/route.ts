import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import type { WorkoutGenerationRequest } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body: WorkoutGenerationRequest = await request.json()
    const { goal, level, daysPerWeek, equipment = [], focusAreas = [] } = body

    // Get user from session
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // AI Prompt for workout generation
    const prompt = `
Create a comprehensive ${level} level ${goal.replace('_', ' ')} workout plan for ${daysPerWeek} days per week.

${equipment.length > 0 ? `Available equipment: ${equipment.join(', ')}` : 'Bodyweight exercises only'}
${focusAreas.length > 0 ? `Focus areas: ${focusAreas.join(', ')}` : ''}

Requirements:
- Provide a structured weekly plan
- Include proper warm-up and cool-down
- Progressive overload principles
- Appropriate rest periods
- Detailed exercise descriptions

Return as valid JSON with this exact structure:
{
  "title": "Workout Plan Title",
  "description": "Brief motivational description",
  "weeks": [
    {
      "weekNumber": 1,
      "days": [
        {
          "day": "Monday",
          "focus": "Chest & Triceps",
          "exercises": [
            {
              "name": "Exercise Name",
              "sets": 3,
              "reps": "8-12",
              "rest": "60s",
              "description": "How to perform this exercise correctly"
            }
          ]
        }
      ]
    }
  ]
}

Provide 4 weeks of progressive training.
    `

    // Generate workout plan using AI
    const { text } = await generateText({
      model: openai(process.env.AI_MODEL || 'gpt-3.5-turbo'),
      prompt,
      temperature: 0.7,
      maxTokens: 3000,
    })

    // Parse the AI response
    let workoutPlan
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/)
      const jsonText = jsonMatch ? jsonMatch[1] : text
      workoutPlan = JSON.parse(jsonText)
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      return NextResponse.json(
        { error: 'Failed to generate valid workout plan' },
        { status: 500 }
      )
    }

    // Save to database
    const { data, error } = await supabase
      .from('workout_plans')
      .insert({
        user_id: user.id,
        title: workoutPlan.title,
        description: workoutPlan.description,
        goal,
        level,
        duration_weeks: workoutPlan.weeks?.length || 4,
        ai_prompt: prompt,
        ai_model: process.env.AI_MODEL || 'gpt-3.5-turbo',
        plan_data: workoutPlan,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to save workout plan' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ...workoutPlan, id: data.id })
  } catch (error) {
    console.error('Workout generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate workout plan' },
      { status: 500 }
    )
  }
}

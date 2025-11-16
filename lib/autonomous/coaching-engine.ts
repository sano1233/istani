/**
 * Autonomous Coaching Engine
 * Automatically generates personalized coaching messages and recommendations
 * Runs periodically via cron jobs or edge functions
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface UserData {
  id: string
  full_name: string
  fitness_goals: string[]
  primary_goal: string
  target_weight_kg: number
  current_weight_kg: number
}

/**
 * Generate morning motivation message
 */
export async function generateMorningMotivation(userId: string) {
  const motivationalMessages = [
    {
      title: '🌅 Rise and Grind!',
      content: 'Every morning is a new opportunity to become a better version of yourself. Your body is capable of amazing things!',
    },
    {
      title: '💪 You\'ve Got This!',
      content: 'The only workout you\'ll regret is the one you didn\'t do. Let\'s make today count!',
    },
    {
      title: '🔥 Fuel Your Fire!',
      content: 'Success is the sum of small efforts repeated day in and day out. Today is another opportunity to build your success!',
    },
    {
      title: '⚡ Unleash Your Potential!',
      content: 'Your only limit is you. Break through your barriers and show yourself what you\'re truly capable of!',
    },
  ]

  const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]

  await supabase.from('coaching_messages').insert({
    user_id: userId,
    message_type: 'motivation',
    title: message.title,
    content: message.content,
    priority: 'normal',
  })
}

/**
 * Generate workout recommendation based on user data
 */
export async function generateWorkoutRecommendation(userId: string) {
  // Get user profile and recent workouts
  const { data: profile } = await supabase
    .from('profiles')
    .select('fitness_goals, primary_goal')
    .eq('id', userId)
    .single()

  const { data: recentWorkouts } = await supabase
    .from('workouts')
    .select('workout_type, duration_minutes, completed_at')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(7)

  // Analyze workout patterns
  const workoutCounts: Record<string, number> = {}
  recentWorkouts?.forEach((workout) => {
    workoutCounts[workout.workout_type] = (workoutCounts[workout.workout_type] || 0) + 1
  })

  // Determine recommended workout type
  let recommendedType = 'strength'
  let reason = 'Balanced training for overall fitness'

  if (profile?.primary_goal === 'fat_loss') {
    recommendedType = 'cardio'
    reason = 'High-intensity cardio to maximize calorie burn for your fat loss goal'
  } else if (profile?.primary_goal === 'muscle_gain') {
    recommendedType = 'strength'
    reason = 'Progressive overload strength training to build muscle mass'
  }

  // Check for imbalances
  if (workoutCounts['cardio'] >= 5 && workoutCounts['strength'] === 0) {
    recommendedType = 'strength'
    reason = 'Balance your training with strength work to maintain muscle mass'
  } else if (workoutCounts['strength'] >= 5 && workoutCounts['cardio'] === 0) {
    recommendedType = 'cardio'
    reason = 'Add cardio for heart health and improved recovery'
  }

  // Generate exercise list based on type
  const exercises = getExercisesForType(recommendedType)

  // Calculate duration
  const duration = recommendedType === 'cardio' ? 30 : 45

  // Save recommendation
  await supabase.from('workout_recommendations').insert({
    user_id: userId,
    workout_type: recommendedType,
    exercises: exercises,
    duration_minutes: duration,
    difficulty_level: 'intermediate',
    reason: reason,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  })

  // Send coaching message
  await supabase.from('coaching_messages').insert({
    user_id: userId,
    message_type: 'tip',
    title: `🎯 Today's Workout Recommendation`,
    content: `We recommend a ${duration}-minute ${recommendedType} session. ${reason}`,
    priority: 'high',
  })
}

/**
 * Get exercises for workout type
 */
function getExercisesForType(type: string): any {
  const exerciseDatabase: Record<string, any> = {
    strength: {
      warmup: [
        { name: 'Dynamic Stretching', duration: 5 },
        { name: 'Light Cardio', duration: 5 },
      ],
      main: [
        { name: 'Barbell Squats', sets: 4, reps: 8, rest: 90 },
        { name: 'Bench Press', sets: 4, reps: 8, rest: 90 },
        { name: 'Deadlifts', sets: 3, reps: 6, rest: 120 },
        { name: 'Pull-ups', sets: 3, reps: 'max', rest: 90 },
        { name: 'Overhead Press', sets: 3, reps: 10, rest: 60 },
      ],
      cooldown: [
        { name: 'Static Stretching', duration: 10 },
      ],
    },
    cardio: {
      warmup: [
        { name: 'Walking', duration: 5 },
      ],
      main: [
        { name: 'Running', duration: 20, intensity: 'moderate-high' },
        { name: 'Battle Ropes', duration: 2, sets: 3, rest: 60 },
        { name: 'Jump Rope', duration: 2, sets: 3, rest: 60 },
      ],
      cooldown: [
        { name: 'Walking', duration: 5 },
        { name: 'Stretching', duration: 5 },
      ],
    },
    flexibility: {
      warmup: [
        { name: 'Light Movement', duration: 5 },
      ],
      main: [
        { name: 'Yoga Flow', duration: 25 },
        { name: 'Deep Stretching', duration: 15 },
      ],
      cooldown: [
        { name: 'Meditation', duration: 5 },
      ],
    },
  }

  return exerciseDatabase[type] || exerciseDatabase.strength
}

/**
 * Analyze progress and send insights
 */
export async function analyzeProgressAndSendInsights(userId: string) {
  // Get user's progress over last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: measurements } = await supabase
    .from('body_measurements')
    .select('*')
    .eq('user_id', userId)
    .gte('measured_at', thirtyDaysAgo.toISOString())
    .order('measured_at', { ascending: true })

  if (!measurements || measurements.length < 2) {
    return // Not enough data
  }

  const firstMeasurement = measurements[0]
  const latestMeasurement = measurements[measurements.length - 1]

  const weightChange = latestMeasurement.weight_kg - firstMeasurement.weight_kg
  const bodyFatChange = latestMeasurement.body_fat_percentage - firstMeasurement.body_fat_percentage

  let message = ''
  let title = ''
  let messageType: 'celebration' | 'tip' | 'adjustment' = 'tip'

  // Weight progress
  if (Math.abs(weightChange) >= 2) {
    if (weightChange < 0) {
      title = '🎉 Great Progress!'
      message = `You've lost ${Math.abs(weightChange).toFixed(1)}kg in the last 30 days! `
      messageType = 'celebration'
    } else {
      const { data: profile } = await supabase
        .from('profiles')
        .select('primary_goal')
        .eq('id', userId)
        .single()

      if (profile?.primary_goal === 'muscle_gain') {
        title = '💪 Muscle Building Progress!'
        message = `You've gained ${weightChange.toFixed(1)}kg - excellent for your muscle building goal! `
        messageType = 'celebration'
      } else if (profile?.primary_goal === 'fat_loss') {
        title = '⚠️ Weight Increase Detected'
        message = `You've gained ${weightChange.toFixed(1)}kg. Let's review your nutrition and training to get back on track. `
        messageType = 'adjustment'
      }
    }

    // Body fat analysis
    if (bodyFatChange < 0) {
      message += `You've also reduced body fat by ${Math.abs(bodyFatChange).toFixed(1)}%. Keep up the excellent work!`
    } else if (bodyFatChange > 0) {
      message += `Body fat increased by ${bodyFatChange.toFixed(1)}%. Focus on protein intake and strength training to maintain muscle mass.`
    }

    await supabase.from('coaching_messages').insert({
      user_id: userId,
      message_type: messageType,
      title: title,
      content: message,
      priority: 'high',
    })
  }

  // Workout consistency check
  const { data: workouts } = await supabase
    .from('workouts')
    .select('completed_at')
    .eq('user_id', userId)
    .gte('completed_at', thirtyDaysAgo.toISOString())

  const workoutsThisMonth = workouts?.length || 0

  if (workoutsThisMonth >= 20) {
    await supabase.from('coaching_messages').insert({
      user_id: userId,
      message_type: 'celebration',
      title: '🏆 Consistency Champion!',
      content: `${workoutsThisMonth} workouts in 30 days! Your dedication is paying off. Results come from consistent effort, and you're nailing it!`,
      priority: 'high',
    })
  } else if (workoutsThisMonth < 8) {
    await supabase.from('coaching_messages').insert({
      user_id: userId,
      message_type: 'tip',
      title: '📅 Let\'s Increase Consistency',
      content: `You completed ${workoutsThisMonth} workouts this month. Aim for at least 12-16 sessions for optimal results. Remember: consistency beats intensity!`,
      priority: 'high',
    })
  }
}

/**
 * Generate nutrition recommendations
 */
export async function generateNutritionRecommendation(userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (!profile) return

  // Calculate macros
  const bmr = calculateBMR(
    profile.weight_kg,
    profile.height_cm,
    profile.age,
    profile.sex
  )
  const tdee = calculateTDEE(bmr, profile.activity_level || 'moderate')

  let calorieTarget = tdee
  if (profile.primary_goal === 'fat_loss') {
    calorieTarget = tdee - 500
  } else if (profile.primary_goal === 'muscle_gain') {
    calorieTarget = tdee + 300
  }

  const proteinGrams = Math.round(profile.weight_kg * 2.2)
  const fatsGrams = Math.round((calorieTarget * 0.25) / 9)
  const carbsGrams = Math.round((calorieTarget - (proteinGrams * 4) - (fatsGrams * 9)) / 4)

  // Generate meal suggestions
  const mealSuggestions = {
    breakfast: {
      name: 'Power Breakfast Bowl',
      items: ['3 whole eggs', '1 cup oatmeal', '1 banana', '1 tbsp peanut butter'],
      calories: Math.round(calorieTarget * 0.3),
      protein: Math.round(proteinGrams * 0.3),
      carbs: Math.round(carbsGrams * 0.35),
      fats: Math.round(fatsGrams * 0.25),
    },
    lunch: {
      name: 'Lean Protein & Veggies',
      items: ['200g chicken breast', '2 cups brown rice', 'Mixed vegetables', 'Olive oil'],
      calories: Math.round(calorieTarget * 0.35),
      protein: Math.round(proteinGrams * 0.4),
      carbs: Math.round(carbsGrams * 0.4),
      fats: Math.round(fatsGrams * 0.35),
    },
    dinner: {
      name: 'Balanced Dinner Plate',
      items: ['200g salmon', 'Sweet potato', 'Steamed broccoli', 'Avocado'],
      calories: Math.round(calorieTarget * 0.3),
      protein: Math.round(proteinGrams * 0.25),
      carbs: Math.round(carbsGrams * 0.2),
      fats: Math.round(fatsGrams * 0.35),
    },
    snack: {
      name: 'Post-Workout Shake',
      items: ['Protein powder', 'Banana', 'Almond butter'],
      calories: Math.round(calorieTarget * 0.05),
      protein: Math.round(proteinGrams * 0.05),
      carbs: Math.round(carbsGrams * 0.05),
      fats: Math.round(fatsGrams * 0.05),
    },
  }

  // Save recommendation
  await supabase.from('nutrition_recommendations').insert({
    user_id: userId,
    meal_type: 'daily_plan',
    recommended_meals: mealSuggestions,
    calories: Math.round(calorieTarget),
    protein_g: proteinGrams,
    carbs_g: carbsGrams,
    fats_g: fatsGrams,
    reason: `Personalized for your ${profile.primary_goal} goal`,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  })

  // Send coaching message
  await supabase.from('coaching_messages').insert({
    user_id: userId,
    message_type: 'tip',
    title: '🍽️ Your Personalized Meal Plan',
    content: `Based on your goals, aim for ${Math.round(calorieTarget)} calories: ${proteinGrams}g protein, ${carbsGrams}g carbs, ${fatsGrams}g fats. Check your nutrition recommendations for meal ideas!`,
    priority: 'normal',
  })
}

/**
 * Helper: Calculate BMR
 */
function calculateBMR(weight: number, height: number, age: number, sex: string): number {
  if (sex === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161
  }
}

/**
 * Helper: Calculate TDEE
 */
function calculateTDEE(bmr: number, activityLevel: string): number {
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  }
  return Math.round(bmr * (multipliers[activityLevel] || 1.55))
}

/**
 * Check for inactive users and send re-engagement
 */
export async function checkInactiveUsers() {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  // Get users who haven't logged a workout in 7 days
  const { data: inactiveUsers } = await supabase
    .from('profiles')
    .select('id, full_name')
    .not('id', 'in', `(
      SELECT DISTINCT user_id
      FROM workouts
      WHERE completed_at >= '${sevenDaysAgo.toISOString()}'
    )`)

  for (const user of inactiveUsers || []) {
    await supabase.from('coaching_messages').insert({
      user_id: user.id,
      message_type: 'reminder',
      title: '👋 We Miss You!',
      content: `Hey ${user.full_name}! It's been a while since your last workout. Life gets busy, but your health is worth the time. Let's get back on track together!`,
      priority: 'high',
    })
  }
}

/**
 * Run all daily coaching tasks
 */
export async function runDailyCoachingTasks() {
  try {
    // Get all active users
    const { data: users } = await supabase
      .from('profiles')
      .select('id')
      .not('id', 'is', null)

    for (const user of users || []) {
      // Morning motivation (6 AM local time would be handled by scheduled function)
      await generateMorningMotivation(user.id)

      // Generate workout recommendation
      await generateWorkoutRecommendation(user.id)

      // Analyze progress (weekly)
      const dayOfWeek = new Date().getDay()
      if (dayOfWeek === 1) { // Monday
        await analyzeProgressAndSendInsights(user.id)
      }

      // Nutrition recommendations (every Sunday)
      if (dayOfWeek === 0) {
        await generateNutritionRecommendation(user.id)
      }
    }

    // Check for inactive users
    await checkInactiveUsers()

    // Log successful run
    await supabase.from('system_health_logs').insert({
      check_type: 'coaching_engine',
      status: 'healthy',
      message: 'Daily coaching tasks completed successfully',
      metadata: { users_processed: users?.length || 0 },
    })
  } catch (error: any) {
    // Log error
    await supabase.from('system_health_logs').insert({
      check_type: 'coaching_engine',
      status: 'critical',
      message: `Coaching engine error: ${error.message}`,
      metadata: { error: error.stack },
    })
  }
}

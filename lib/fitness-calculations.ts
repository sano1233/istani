import type { ActivityLevel, FitnessGoal, FitnessMetrics } from '@/types'

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
 * This is the most accurate formula for modern populations
 */
export function calculateBMR(
  weight_kg: number,
  height_cm: number,
  age: number,
  gender: 'male' | 'female'
): number {
  if (gender === 'male') {
    return 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
  } else {
    return 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
  }
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 * Multiplies BMR by activity level multiplier
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multipliers = {
    sedentary: 1.2, // Little or no exercise
    light: 1.375, // Light exercise 1-3 days/week
    moderate: 1.55, // Moderate exercise 3-5 days/week
    active: 1.725, // Heavy exercise 6-7 days/week
    very_active: 1.9, // Very heavy exercise, physical job
  }

  return bmr * multipliers[activityLevel]
}

/**
 * Calculate daily calorie target based on fitness goal
 */
export function calculateCalorieTarget(tdee: number, goal: FitnessGoal): number {
  const adjustments = {
    weight_loss: -500, // 500 cal deficit = ~1 lb/week loss
    muscle_gain: 300, // 300 cal surplus for lean muscle gain
    maintenance: 0,
    athletic_performance: 200, // Slight surplus for performance
  }

  return Math.round(tdee + adjustments[goal])
}

/**
 * Calculate macronutrient targets in grams
 * Based on evidence-based recommendations for each goal
 */
export function calculateMacros(
  weight_kg: number,
  calorieTarget: number,
  goal: FitnessGoal
): {
  protein_g: number
  carbs_g: number
  fats_g: number
} {
  let proteinPerKg: number
  let fatPercentage: number

  // Evidence-based protein recommendations
  switch (goal) {
    case 'muscle_gain':
      proteinPerKg = 2.2 // 2.2g per kg for muscle building
      fatPercentage = 0.25 // 25% of calories from fat
      break
    case 'weight_loss':
      proteinPerKg = 2.4 // Higher protein preserves muscle during cut
      fatPercentage = 0.25
      break
    case 'athletic_performance':
      proteinPerKg = 2.0
      fatPercentage = 0.3
      break
    default: // maintenance
      proteinPerKg = 1.6
      fatPercentage = 0.3
  }

  const protein_g = Math.round(weight_kg * proteinPerKg)
  const proteinCalories = protein_g * 4

  const fats_g = Math.round((calorieTarget * fatPercentage) / 9)
  const fatCalories = fats_g * 9

  const carbCalories = calorieTarget - proteinCalories - fatCalories
  const carbs_g = Math.round(carbCalories / 4)

  return {
    protein_g,
    carbs_g: Math.max(carbs_g, 0),
    fats_g,
  }
}

/**
 * Calculate complete fitness metrics for a user
 */
export function calculateFitnessMetrics(
  weight_kg: number,
  height_cm: number,
  age: number,
  gender: 'male' | 'female',
  activityLevel: ActivityLevel,
  goal: FitnessGoal
): FitnessMetrics {
  const bmr = calculateBMR(weight_kg, height_cm, age, gender)
  const tdee = calculateTDEE(bmr, activityLevel)
  const calorieTarget = calculateCalorieTarget(tdee, goal)
  const macros = calculateMacros(weight_kg, calorieTarget, goal)

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    proteinTarget: macros.protein_g,
    carbsTarget: macros.carbs_g,
    fatsTarget: macros.fats_g,
  }
}

/**
 * Calculate Body Mass Index (BMI)
 */
export function calculateBMI(weight_kg: number, height_cm: number): number {
  const height_m = height_cm / 100
  return Number((weight_kg / (height_m * height_m)).toFixed(1))
}

/**
 * Get BMI category
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Normal'
  if (bmi < 30) return 'Overweight'
  return 'Obese'
}

/**
 * Calculate estimated body fat percentage using Navy Method
 */
export function calculateBodyFat(
  gender: 'male' | 'female',
  height_cm: number,
  waist_cm: number,
  neck_cm: number,
  hip_cm?: number
): number {
  if (gender === 'male') {
    return (
      495 /
        (1.0324 -
          0.19077 * Math.log10(waist_cm - neck_cm) +
          0.15456 * Math.log10(height_cm)) -
      450
    )
  } else {
    if (!hip_cm) return 0
    return (
      495 /
        (1.29579 -
          0.35004 * Math.log10(waist_cm + hip_cm - neck_cm) +
          0.221 * Math.log10(height_cm)) -
      450
    )
  }
}

/**
 * Calculate one rep max using Epley formula
 */
export function calculateOneRepMax(weight_kg: number, reps: number): number {
  if (reps === 1) return weight_kg
  return weight_kg * (1 + reps / 30)
}

/**
 * Calculate ideal weight range based on height
 */
export function calculateIdealWeightRange(
  height_cm: number,
  gender: 'male' | 'female'
): { min: number; max: number } {
  const height_m = height_cm / 100
  const bmi_min = 18.5
  const bmi_max = 24.9

  return {
    min: Math.round(bmi_min * height_m * height_m),
    max: Math.round(bmi_max * height_m * height_m),
  }
}

/**
 * Calculate water intake recommendation (liters per day)
 */
export function calculateWaterIntake(weight_kg: number, activityLevel: ActivityLevel): number {
  // Base: 35ml per kg of body weight
  let base = (weight_kg * 35) / 1000

  // Add extra for activity
  const activityBonus = {
    sedentary: 0,
    light: 0.5,
    moderate: 1,
    active: 1.5,
    very_active: 2,
  }

  return Number((base + activityBonus[activityLevel]).toFixed(1))
}

/**
 * Estimate calories burned during workout
 */
export function estimateCaloriesBurned(
  weight_kg: number,
  duration_minutes: number,
  workoutType: string
): number {
  // MET (Metabolic Equivalent of Task) values
  const metValues: Record<string, number> = {
    strength: 6.0,
    cardio: 8.0,
    flexibility: 2.5,
    sports: 7.0,
    other: 5.0,
  }

  const met = metValues[workoutType] || 5.0
  const caloriesPerMinute = (met * 3.5 * weight_kg) / 200

  return Math.round(caloriesPerMinute * duration_minutes)
}

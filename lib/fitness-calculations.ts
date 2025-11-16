export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100
  return Number((weightKg / (heightM * heightM)).toFixed(1))
}

export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: 'male' | 'female'
): number {
  // Mifflin-St Jeor Equation
  if (sex === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5
  } else {
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 161
  }
}

export function calculateTDEE(bmr: number, activityLevel: string): number {
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  }
  return Math.round(bmr * (multipliers[activityLevel] || 1.2))
}

export function calculateCalorieTarget(
  tdee: number,
  goal: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'athletic_performance'
): number {
  switch (goal) {
    case 'weight_loss':
      return Math.max(1200, Math.round(tdee - 500))
    case 'muscle_gain':
      return Math.round(tdee + 300)
    case 'athletic_performance':
      return Math.round(tdee + 200)
    default:
      return Math.round(tdee)
  }
}

export function calculateMacros(
  weightKg: number,
  calories: number,
  goal: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'athletic_performance'
): { protein: number; carbs: number; fats: number } {
  let proteinPercent = 0.3
  let carbsPercent = 0.4
  let fatsPercent = 0.3

  if (goal === 'muscle_gain') {
    proteinPercent = 0.35
    carbsPercent = 0.45
    fatsPercent = 0.2
  } else if (goal === 'weight_loss') {
    proteinPercent = 0.4
    carbsPercent = 0.3
    fatsPercent = 0.3
  }

  const protein = Math.round((calories * proteinPercent) / 4)
  const carbs = Math.round((calories * carbsPercent) / 4)
  const fats = Math.round((calories * fatsPercent) / 9)

  return { protein, carbs, fats }
}

export function calculateWaterIntake(weightKg: number, activityLevel?: string): number {
  // 35ml per kg of body weight
  let glasses = Math.round((weightKg * 35) / 250)
  if (activityLevel === 'active') glasses += 1
  if (activityLevel === 'very_active') glasses += 2
  return glasses // in 250ml glasses
}

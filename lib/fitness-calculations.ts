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

export function calculateMacros(
  calories: number,
  goal: string,
  _weightKg?: number,
): { protein: number; carbs: number; fats: number } {
  let proteinPercent = 0.3
  let carbsPercent = 0.4
  let fatsPercent = 0.3

  if (goal === 'muscle_gain') {
    proteinPercent = 0.35
    carbsPercent = 0.45
    fatsPercent = 0.2
  } else if (goal === 'fat_loss') {
    proteinPercent = 0.4
    carbsPercent = 0.3
    fatsPercent = 0.3
  }

  return {
    protein: Math.round((calories * proteinPercent) / 4),
    carbs: Math.round((calories * carbsPercent) / 4),
    fats: Math.round((calories * fatsPercent) / 9),
  }
}

export function calculateWaterIntake(weightKg: number): number {
  // 35ml per kg of body weight
  return Math.round((weightKg * 35) / 250) // in 250ml glasses
}

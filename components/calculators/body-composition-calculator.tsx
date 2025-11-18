'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BodyStats {
  weight_kg: number;
  height_cm: number;
  age: number;
  gender: 'male' | 'female';
  neck_cm?: number;
  waist_cm?: number;
  hip_cm?: number;
  activity_level: string;
}

interface Results {
  bmi: number;
  bmi_category: string;
  body_fat_percentage: number;
  lean_mass_kg: number;
  fat_mass_kg: number;
  bmr: number;
  tdee: number;
  ideal_weight_kg: { min: number; max: number };
  macros: {
    maintain: { protein: number; carbs: number; fat: number; calories: number };
    cut: { protein: number; carbs: number; fat: number; calories: number };
    bulk: { protein: number; carbs: number; fat: number; calories: number };
  };
}

export function BodyCompositionCalculator() {
  const [stats, setStats] = useState<BodyStats>({
    weight_kg: 70,
    height_cm: 170,
    age: 30,
    gender: 'male',
    activity_level: 'moderate',
  });

  const [results, setResults] = useState<Results | null>(null);
  const [method, setMethod] = useState<'navy' | 'simple'>('simple');

  const calculateBMI = (): number => {
    const height_m = stats.height_cm / 100;
    return stats.weight_kg / (height_m * height_m);
  };

  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const calculateBodyFat = (): number => {
    if (method === 'navy' && stats.neck_cm && stats.waist_cm) {
      // Navy Method (more accurate with measurements)
      const height_cm = stats.height_cm;
      const neck_cm = stats.neck_cm;
      const waist_cm = stats.waist_cm;
      const hip_cm = stats.hip_cm || 0;

      if (stats.gender === 'male') {
        // Male formula: 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
        const factor = 86.010 * Math.log10(waist_cm - neck_cm) - 70.041 * Math.log10(height_cm) + 36.76;
        return Math.max(3, Math.min(50, factor));
      } else {
        // Female formula with hip measurement
        if (hip_cm > 0) {
          const factor = 163.205 * Math.log10(waist_cm + hip_cm - neck_cm) - 97.684 * Math.log10(height_cm) - 78.387;
          return Math.max(10, Math.min(50, factor));
        }
      }
    }

    // Simple formula based on BMI (less accurate but doesn't require measurements)
    const bmi = calculateBMI();
    const age = stats.age;

    if (stats.gender === 'male') {
      return (1.20 * bmi) + (0.23 * age) - 16.2;
    } else {
      return (1.20 * bmi) + (0.23 * age) - 5.4;
    }
  };

  const calculateBMR = (): number => {
    // Mifflin-St Jeor Equation (most accurate)
    if (stats.gender === 'male') {
      return (10 * stats.weight_kg) + (6.25 * stats.height_cm) - (5 * stats.age) + 5;
    } else {
      return (10 * stats.weight_kg) + (6.25 * stats.height_cm) - (5 * stats.age) - 161;
    }
  };

  const calculateTDEE = (bmr: number): number => {
    const activityMultipliers: { [key: string]: number } = {
      sedentary: 1.2,        // Little to no exercise
      light: 1.375,          // Light exercise 1-3 days/week
      moderate: 1.55,        // Moderate exercise 3-5 days/week
      active: 1.725,         // Hard exercise 6-7 days/week
      very_active: 1.9,      // Very hard exercise, physical job
    };

    return bmr * activityMultipliers[stats.activity_level];
  };

  const calculateIdealWeight = (): { min: number; max: number } => {
    const height_m = stats.height_cm / 100;
    // Using BMI of 18.5-24.9 for normal weight range
    return {
      min: Math.round(18.5 * height_m * height_m),
      max: Math.round(24.9 * height_m * height_m),
    };
  };

  const calculateMacros = (tdee: number) => {
    const weight_kg = stats.weight_kg;

    // Protein: 1.8-2.2g per kg bodyweight
    const protein_per_kg = 2.0;
    const protein_g = weight_kg * protein_per_kg;

    return {
      maintain: {
        calories: Math.round(tdee),
        protein: Math.round(protein_g),
        fat: Math.round((tdee * 0.25) / 9),
        carbs: Math.round((tdee - (protein_g * 4) - ((tdee * 0.25))) / 4),
      },
      cut: {
        calories: Math.round(tdee - 500),
        protein: Math.round(protein_g),
        fat: Math.round(((tdee - 500) * 0.25) / 9),
        carbs: Math.round(((tdee - 500) - (protein_g * 4) - (((tdee - 500) * 0.25))) / 4),
      },
      bulk: {
        calories: Math.round(tdee + 300),
        protein: Math.round(protein_g),
        fat: Math.round(((tdee + 300) * 0.25) / 9),
        carbs: Math.round(((tdee + 300) - (protein_g * 4) - (((tdee + 300) * 0.25))) / 4),
      },
    };
  };

  const calculate = () => {
    const bmi = calculateBMI();
    const body_fat = calculateBodyFat();
    const bmr = calculateBMR();
    const tdee = calculateTDEE(bmr);
    const fat_mass = (body_fat / 100) * stats.weight_kg;
    const lean_mass = stats.weight_kg - fat_mass;
    const ideal_weight = calculateIdealWeight();
    const macros = calculateMacros(tdee);

    setResults({
      bmi,
      bmi_category: getBMICategory(bmi),
      body_fat_percentage: body_fat,
      lean_mass_kg: lean_mass,
      fat_mass_kg: fat_mass,
      bmr,
      tdee,
      ideal_weight_kg: ideal_weight,
      macros,
    });
  };

  const getBMICategoryColor = (category: string): string => {
    switch (category) {
      case 'Underweight':
        return 'text-blue-400';
      case 'Normal weight':
        return 'text-green-400';
      case 'Overweight':
        return 'text-yellow-400';
      case 'Obese':
        return 'text-red-400';
      default:
        return 'text-white';
    }
  };

  const getBodyFatColor = (bf: number, gender: string): string => {
    if (gender === 'male') {
      if (bf < 6) return 'text-red-400';
      if (bf < 14) return 'text-green-400';
      if (bf < 18) return 'text-yellow-400';
      if (bf < 25) return 'text-orange-400';
      return 'text-red-400';
    } else {
      if (bf < 14) return 'text-red-400';
      if (bf < 21) return 'text-green-400';
      if (bf < 25) return 'text-yellow-400';
      if (bf < 32) return 'text-orange-400';
      return 'text-red-400';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Body Composition Calculator</h1>
        <p className="text-white/60">
          Calculate BMI, body fat %, BMR, TDEE, and personalized macro recommendations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Your Information</h2>

          <div className="space-y-4">
            {/* Gender */}
            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2">Gender</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setStats({ ...stats, gender: 'male' })}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                    stats.gender === 'male'
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-white/5 border-white/10 text-white/60'
                  }`}
                >
                  Male
                </button>
                <button
                  onClick={() => setStats({ ...stats, gender: 'female' })}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                    stats.gender === 'female'
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-white/5 border-white/10 text-white/60'
                  }`}
                >
                  Female
                </button>
              </div>
            </div>

            {/* Age */}
            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2">Age (years)</label>
              <input
                type="number"
                value={stats.age}
                onChange={(e) => setStats({ ...stats, age: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={stats.weight_kg}
                onChange={(e) => setStats({ ...stats, weight_kg: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              />
            </div>

            {/* Height */}
            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2">Height (cm)</label>
              <input
                type="number"
                value={stats.height_cm}
                onChange={(e) => setStats({ ...stats, height_cm: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              />
            </div>

            {/* Activity Level */}
            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2">Activity Level</label>
              <select
                value={stats.activity_level}
                onChange={(e) => setStats({ ...stats, activity_level: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              >
                <option value="sedentary">Sedentary (little to no exercise)</option>
                <option value="light">Light (1-3 days/week)</option>
                <option value="moderate">Moderate (3-5 days/week)</option>
                <option value="active">Active (6-7 days/week)</option>
                <option value="very_active">Very Active (twice per day)</option>
              </select>
            </div>

            {/* Method Selection */}
            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2">
                Body Fat Calculation Method
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setMethod('simple')}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                    method === 'simple'
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-white/5 border-white/10 text-white/60'
                  }`}
                >
                  Simple (BMI-based)
                </button>
                <button
                  onClick={() => setMethod('navy')}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                    method === 'navy'
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-white/5 border-white/10 text-white/60'
                  }`}
                >
                  Navy Method
                </button>
              </div>
            </div>

            {/* Navy Method Measurements */}
            {method === 'navy' && (
              <>
                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">
                    Neck Circumference (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={stats.neck_cm || ''}
                    onChange={(e) => setStats({ ...stats, neck_cm: parseFloat(e.target.value) || undefined })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    placeholder="Required for Navy method"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">
                    Waist Circumference (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={stats.waist_cm || ''}
                    onChange={(e) =>
                      setStats({ ...stats, waist_cm: parseFloat(e.target.value) || undefined })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    placeholder="Required for Navy method"
                  />
                </div>

                {stats.gender === 'female' && (
                  <div>
                    <label className="block text-white/80 text-sm font-semibold mb-2">
                      Hip Circumference (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={stats.hip_cm || ''}
                      onChange={(e) =>
                        setStats({ ...stats, hip_cm: parseFloat(e.target.value) || undefined })
                      }
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                      placeholder="Required for females (Navy method)"
                    />
                  </div>
                )}
              </>
            )}

            <Button onClick={calculate} className="w-full">
              <span className="material-symbols-outlined mr-2">calculate</span>
              Calculate
            </Button>
          </div>
        </Card>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* BMI & Body Composition */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Body Composition</h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-white/60 text-sm mb-1">BMI</p>
                  <p className={`text-3xl font-bold ${getBMICategoryColor(results.bmi_category)}`}>
                    {results.bmi.toFixed(1)}
                  </p>
                  <p className={`text-sm ${getBMICategoryColor(results.bmi_category)}`}>
                    {results.bmi_category}
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-white/60 text-sm mb-1">Body Fat</p>
                  <p
                    className={`text-3xl font-bold ${getBodyFatColor(
                      results.body_fat_percentage,
                      stats.gender
                    )}`}
                  >
                    {results.body_fat_percentage.toFixed(1)}%
                  </p>
                  <p className="text-white/60 text-xs mt-1">
                    {method === 'navy' ? 'Navy Method' : 'Estimated'}
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-white/60 text-sm mb-1">Lean Mass</p>
                  <p className="text-2xl font-bold text-green-400">
                    {results.lean_mass_kg.toFixed(1)} kg
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-white/60 text-sm mb-1">Fat Mass</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {results.fat_mass_kg.toFixed(1)} kg
                  </p>
                </div>
              </div>

              <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                <p className="text-white/80 text-sm mb-1">Ideal Weight Range</p>
                <p className="text-xl font-bold text-primary">
                  {results.ideal_weight_kg.min} - {results.ideal_weight_kg.max} kg
                </p>
                <p className="text-white/60 text-xs mt-1">Based on healthy BMI range (18.5-24.9)</p>
              </div>
            </Card>

            {/* Calorie Requirements */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Daily Calorie Requirements</h2>

              <div className="space-y-3">
                <div className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/80">BMR (Basal Metabolic Rate)</span>
                    <span className="text-2xl font-bold text-white">{results.bmr.toFixed(0)}</span>
                  </div>
                  <p className="text-white/60 text-xs">Calories burned at rest</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">TDEE (Total Daily Energy Expenditure)</span>
                    <span className="text-3xl font-bold text-primary">{results.tdee.toFixed(0)}</span>
                  </div>
                  <p className="text-white/80 text-sm">
                    Calories needed to maintain your current weight
                  </p>
                </div>
              </div>
            </Card>

            {/* Macro Recommendations */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Macro Recommendations</h2>

              <div className="space-y-4">
                {/* Maintain */}
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-green-400">Maintain Weight</h3>
                    <span className="text-2xl font-bold text-white">
                      {results.macros.maintain.calories} cal
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-white/5 rounded">
                      <p className="text-xl font-bold text-white">{results.macros.maintain.protein}g</p>
                      <p className="text-white/60 text-xs">Protein</p>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded">
                      <p className="text-xl font-bold text-white">{results.macros.maintain.carbs}g</p>
                      <p className="text-white/60 text-xs">Carbs</p>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded">
                      <p className="text-xl font-bold text-white">{results.macros.maintain.fat}g</p>
                      <p className="text-white/60 text-xs">Fat</p>
                    </div>
                  </div>
                </div>

                {/* Cut (Fat Loss) */}
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-red-400">Cut (Fat Loss)</h3>
                    <span className="text-2xl font-bold text-white">
                      {results.macros.cut.calories} cal
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-white/5 rounded">
                      <p className="text-xl font-bold text-white">{results.macros.cut.protein}g</p>
                      <p className="text-white/60 text-xs">Protein</p>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded">
                      <p className="text-xl font-bold text-white">{results.macros.cut.carbs}g</p>
                      <p className="text-white/60 text-xs">Carbs</p>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded">
                      <p className="text-xl font-bold text-white">{results.macros.cut.fat}g</p>
                      <p className="text-white/60 text-xs">Fat</p>
                    </div>
                  </div>
                  <p className="text-white/60 text-xs mt-2">-500 cal deficit for ~0.5kg/week loss</p>
                </div>

                {/* Bulk (Muscle Gain) */}
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-blue-400">Bulk (Muscle Gain)</h3>
                    <span className="text-2xl font-bold text-white">
                      {results.macros.bulk.calories} cal
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-white/5 rounded">
                      <p className="text-xl font-bold text-white">{results.macros.bulk.protein}g</p>
                      <p className="text-white/60 text-xs">Protein</p>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded">
                      <p className="text-xl font-bold text-white">{results.macros.bulk.carbs}g</p>
                      <p className="text-white/60 text-xs">Carbs</p>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded">
                      <p className="text-xl font-bold text-white">{results.macros.bulk.fat}g</p>
                      <p className="text-white/60 text-xs">Fat</p>
                    </div>
                  </div>
                  <p className="text-white/60 text-xs mt-2">+300 cal surplus for lean muscle gain</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

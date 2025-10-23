'use client';

import { useState } from 'react';

type CalculatorType = 'bmi' | 'calories' | 'macros' | 'tdee';

export default function Home() {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType | null>(null);

  // BMI Calculator State
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmiResult, setBmiResult] = useState<{ bmi: number; category: string } | null>(null);

  // Calorie/TDEE Calculator State
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [activityLevel, setActivityLevel] = useState('1.2');
  const [calorieResult, setCalorieResult] = useState<number | null>(null);

  // Macros Calculator State
  const [calories, setCalories] = useState('');
  const [goal, setGoal] = useState('maintain');
  const [macrosResult, setMacrosResult] = useState<{ protein: number; carbs: number; fats: number } | null>(null);

  const calculateBMI = () => {
    const h = parseFloat(height) / 100; // convert cm to m
    const w = parseFloat(weight);
    const bmi = w / (h * h);
    let category = '';

    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal weight';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';

    setBmiResult({ bmi: Math.round(bmi * 10) / 10, category });
  };

  const calculateTDEE = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    const activity = parseFloat(activityLevel);

    // Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
      bmr = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      bmr = 10 * w + 6.25 * h - 5 * a - 161;
    }

    const tdee = bmr * activity;
    setCalorieResult(Math.round(tdee));
  };

  const calculateMacros = () => {
    const cals = parseFloat(calories);
    let proteinPct = 0.3;
    let fatsPct = 0.25;
    let carbsPct = 0.45;

    if (goal === 'cut') {
      proteinPct = 0.4;
      fatsPct = 0.25;
      carbsPct = 0.35;
    } else if (goal === 'bulk') {
      proteinPct = 0.3;
      fatsPct = 0.25;
      carbsPct = 0.45;
    }

    setMacrosResult({
      protein: Math.round((cals * proteinPct) / 4),
      carbs: Math.round((cals * carbsPct) / 4),
      fats: Math.round((cals * fatsPct) / 9)
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="https://istani.store" className="flex items-center gap-2 transition-colors hover:text-purple-400">
              <div className="text-2xl">💪</div>
              <span className="text-xl font-semibold tracking-tight">Istani Fitness</span>
            </a>
            <a
              href={process.env.NEXT_PUBLIC_SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-2 text-sm font-semibold text-black transition-transform hover:scale-105"
            >
              ☕ Support Us
            </a>
          </div>
        </div>
      </nav>

      {/* Google AdSense Placeholder */}
      <div className="mx-auto mt-20 max-w-7xl px-6 py-4">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center text-sm text-gray-400">
          [Google Ads Space]
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        {!activeCalculator ? (
          <>
            <div className="text-center mb-12">
              <h1 className="mb-4 text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Autonomous Fitness Calculator
              </h1>
              <p className="text-xl text-gray-300">
                AI-Powered fitness calculations for your health journey
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <button
                onClick={() => setActiveCalculator('bmi')}
                className="group rounded-2xl border border-white/10 bg-gradient-to-br from-blue-950/50 to-black p-8 transition-all hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/20"
              >
                <div className="mb-4 text-5xl">📊</div>
                <h3 className="mb-2 text-xl font-semibold text-blue-400">BMI Calculator</h3>
                <p className="text-sm text-gray-400">Calculate your Body Mass Index</p>
              </button>

              <button
                onClick={() => setActiveCalculator('calories')}
                className="group rounded-2xl border border-white/10 bg-gradient-to-br from-purple-950/50 to-black p-8 transition-all hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/20"
              >
                <div className="mb-4 text-5xl">🔥</div>
                <h3 className="mb-2 text-xl font-semibold text-purple-400">Calorie Calculator</h3>
                <p className="text-sm text-gray-400">Find your daily calorie needs</p>
              </button>

              <button
                onClick={() => setActiveCalculator('macros')}
                className="group rounded-2xl border border-white/10 bg-gradient-to-br from-green-950/50 to-black p-8 transition-all hover:border-green-500/50 hover:shadow-xl hover:shadow-green-500/20"
              >
                <div className="mb-4 text-5xl">🥗</div>
                <h3 className="mb-2 text-xl font-semibold text-green-400">Macro Calculator</h3>
                <p className="text-sm text-gray-400">Calculate protein, carbs, and fats</p>
              </button>

              <button
                onClick={() => setActiveCalculator('tdee')}
                className="group rounded-2xl border border-white/10 bg-gradient-to-br from-orange-950/50 to-black p-8 transition-all hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/20"
              >
                <div className="mb-4 text-5xl">⚡</div>
                <h3 className="mb-2 text-xl font-semibold text-orange-400">TDEE Calculator</h3>
                <p className="text-sm text-gray-400">Total Daily Energy Expenditure</p>
              </button>
            </div>
          </>
        ) : (
          <div className="mx-auto max-w-2xl">
            <button
              onClick={() => {
                setActiveCalculator(null);
                setBmiResult(null);
                setCalorieResult(null);
                setMacrosResult(null);
              }}
              className="mb-6 text-purple-400 hover:text-purple-300"
            >
              ← Back to Calculators
            </button>

            {activeCalculator === 'bmi' && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                <h2 className="mb-6 text-3xl font-bold text-blue-400">BMI Calculator</h2>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Height (cm)</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                      placeholder="170"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Weight (kg)</label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                      placeholder="70"
                    />
                  </div>

                  <button
                    onClick={calculateBMI}
                    className="w-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold transition-all hover:scale-105"
                  >
                    Calculate BMI
                  </button>

                  {bmiResult && (
                    <div className="mt-6 rounded-lg border border-blue-500/30 bg-blue-500/10 p-6">
                      <p className="text-center text-4xl font-bold">{bmiResult.bmi}</p>
                      <p className="mt-2 text-center text-xl text-blue-400">{bmiResult.category}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(activeCalculator === 'calories' || activeCalculator === 'tdee') && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                <h2 className="mb-6 text-3xl font-bold text-purple-400">
                  {activeCalculator === 'tdee' ? 'TDEE' : 'Calorie'} Calculator
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                      placeholder="25"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Height (cm)</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                      placeholder="170"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Weight (kg)</label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                      placeholder="70"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Activity Level</label>
                    <select
                      value={activityLevel}
                      onChange={(e) => setActivityLevel(e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="1.2">Sedentary (little to no exercise)</option>
                      <option value="1.375">Lightly active (1-3 days/week)</option>
                      <option value="1.55">Moderately active (3-5 days/week)</option>
                      <option value="1.725">Very active (6-7 days/week)</option>
                      <option value="1.9">Extremely active (athlete)</option>
                    </select>
                  </div>

                  <button
                    onClick={calculateTDEE}
                    className="w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold transition-all hover:scale-105"
                  >
                    Calculate
                  </button>

                  {calorieResult && (
                    <div className="mt-6 rounded-lg border border-purple-500/30 bg-purple-500/10 p-6">
                      <p className="text-center text-sm text-gray-300">Daily Calorie Needs</p>
                      <p className="mt-2 text-center text-4xl font-bold">{calorieResult} cal</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeCalculator === 'macros' && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                <h2 className="mb-6 text-3xl font-bold text-green-400">Macro Calculator</h2>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Daily Calories</label>
                    <input
                      type="number"
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-green-500 focus:outline-none"
                      placeholder="2000"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Goal</label>
                    <select
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-green-500 focus:outline-none"
                    >
                      <option value="cut">Cut (Fat Loss)</option>
                      <option value="maintain">Maintain</option>
                      <option value="bulk">Bulk (Muscle Gain)</option>
                    </select>
                  </div>

                  <button
                    onClick={calculateMacros}
                    className="w-full rounded-full bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 font-semibold transition-all hover:scale-105"
                  >
                    Calculate Macros
                  </button>

                  {macrosResult && (
                    <div className="mt-6 space-y-3">
                      <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                        <p className="text-sm text-gray-300">Protein</p>
                        <p className="text-2xl font-bold">{macrosResult.protein}g</p>
                      </div>
                      <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                        <p className="text-sm text-gray-300">Carbohydrates</p>
                        <p className="text-2xl font-bold">{macrosResult.carbs}g</p>
                      </div>
                      <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
                        <p className="text-sm text-gray-300">Fats</p>
                        <p className="text-2xl font-bold">{macrosResult.fats}g</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-white/10 px-6 py-8">
        <div className="mx-auto max-w-7xl text-center text-sm text-gray-500">
          <p>© 2025 Istani Fitness. Powered by Autonomous AI</p>
          <p className="mt-2">
            <a href="https://istani.store" className="hover:text-white">
              Visit Istani Store
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

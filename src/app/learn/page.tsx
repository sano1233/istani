'use client';

import { useState } from 'react';

type ContentType = 'muscle' | 'fat-loss' | 'nutrition' | 'exercise' | null;

export default function LearnPage() {
  const [activeContent, setActiveContent] = useState<ContentType>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 transition-colors hover:text-purple-400">
              <div className="text-2xl">💪</div>
              <span className="text-xl font-semibold tracking-tight">Istani Fitness</span>
            </a>
            <div className="flex items-center gap-3">
              <a href="/dashboard" className="text-sm text-gray-400 hover:text-white">
                Dashboard
              </a>
              <a href="/auth" className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 text-sm font-semibold transition-transform hover:scale-105">
                Sign In
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-24">
        {!activeContent ? (
          <>
            <div className="mb-12 text-center">
              <h1 className="mb-4 text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Fitness Science Education
              </h1>
              <p className="text-xl text-gray-300">
                Evidence-based knowledge to transform your fitness journey
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <button
                onClick={() => setActiveContent('muscle')}
                className="group rounded-2xl border border-white/10 bg-gradient-to-br from-blue-950/50 to-black p-8 text-left transition-all hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/20"
              >
                <div className="mb-4 text-5xl">💪</div>
                <h3 className="mb-2 text-2xl font-semibold text-blue-400">Muscle Building Science</h3>
                <p className="text-gray-400">
                  Learn about progressive overload, hypertrophy, training volume, and evidence-based muscle building strategies.
                </p>
              </button>

              <button
                onClick={() => setActiveContent('fat-loss')}
                className="group rounded-2xl border border-white/10 bg-gradient-to-br from-purple-950/50 to-black p-8 text-left transition-all hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/20"
              >
                <div className="mb-4 text-5xl">🔥</div>
                <h3 className="mb-2 text-2xl font-semibold text-purple-400">Fat Loss Strategies</h3>
                <p className="text-gray-400">
                  Understanding calorie deficits, metabolic adaptation, and sustainable fat loss approaches backed by science.
                </p>
              </button>

              <button
                onClick={() => setActiveContent('nutrition')}
                className="group rounded-2xl border border-white/10 bg-gradient-to-br from-green-950/50 to-black p-8 text-left transition-all hover:border-green-500/50 hover:shadow-xl hover:shadow-green-500/20"
              >
                <div className="mb-4 text-5xl">🥗</div>
                <h3 className="mb-2 text-2xl font-semibold text-green-400">Nutrition Fundamentals</h3>
                <p className="text-gray-400">
                  Macronutrients, micronutrients, meal timing, and how to fuel your body for optimal performance.
                </p>
              </button>

              <button
                onClick={() => setActiveContent('exercise')}
                className="group rounded-2xl border border-white/10 bg-gradient-to-br from-orange-950/50 to-black p-8 text-left transition-all hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/20"
              >
                <div className="mb-4 text-5xl">🏃</div>
                <h3 className="mb-2 text-2xl font-semibold text-orange-400">Exercise Science</h3>
                <p className="text-gray-400">
                  Proper form, exercise selection, training principles, and how to maximize your workout effectiveness.
                </p>
              </button>
            </div>
          </>
        ) : (
          <div className="mx-auto max-w-4xl">
            <button
              onClick={() => setActiveContent(null)}
              className="mb-6 text-purple-400 hover:text-purple-300"
            >
              ← Back to Topics
            </button>

            {activeContent === 'muscle' && (
              <article className="rounded-2xl border border-white/10 bg-white/5 p-8">
                <h1 className="mb-6 text-4xl font-bold text-blue-400">Muscle Building Science</h1>

                <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-semibold text-blue-300">Progressive Overload</h2>
                  <p className="mb-4 text-gray-300 leading-relaxed">
                    Progressive overload is the foundation of muscle growth. To build muscle, you must continuously increase the demands placed on your muscles over time. This can be achieved through:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-300">
                    <li>Increasing weight lifted</li>
                    <li>Increasing repetitions performed</li>
                    <li>Increasing training volume (sets × reps × weight)</li>
                    <li>Improving exercise technique and range of motion</li>
                    <li>Reducing rest periods between sets</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-semibold text-blue-300">Optimal Training Volume</h2>
                  <p className="mb-4 text-gray-300 leading-relaxed">
                    Research shows that <strong>10-20 sets per muscle group per week</strong> is optimal for hypertrophy (muscle growth). This volume should be distributed across 2-3 training sessions for each muscle group.
                  </p>
                  <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-4">
                    <p className="text-sm text-blue-300">
                      <strong>Example:</strong> For chest development, perform 12-16 total sets per week across 2 workouts (e.g., Monday: 6-8 sets, Thursday: 6-8 sets).
                    </p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-semibold text-blue-300">Rep Ranges for Hypertrophy</h2>
                  <p className="mb-4 text-gray-300 leading-relaxed">
                    While muscles can grow across various rep ranges, the <strong>6-12 rep range</strong> is most efficient for muscle building:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-300">
                    <li><strong>6-8 reps:</strong> Heavy weight, builds strength and muscle</li>
                    <li><strong>8-12 reps:</strong> Moderate weight, optimal for hypertrophy</li>
                    <li><strong>12-15 reps:</strong> Lighter weight, muscle endurance and pump</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-semibold text-blue-300">Compound vs. Isolation Exercises</h2>
                  <p className="mb-4 text-gray-300 leading-relaxed">
                    <strong>Compound exercises</strong> should form the foundation of your training as they:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-300">
                    <li>Work multiple muscle groups simultaneously</li>
                    <li>Allow heavier loads to be lifted</li>
                    <li>Produce greater hormonal response</li>
                    <li>Are more time-efficient</li>
                  </ul>
                  <p className="mt-4 text-gray-300 leading-relaxed">
                    Examples: Squats, Deadlifts, Bench Press, Rows, Overhead Press
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-2xl font-semibold text-blue-300">Recovery and Growth</h2>
                  <p className="mb-4 text-gray-300 leading-relaxed">
                    Muscles grow during rest, not during training. Ensure:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-300">
                    <li><strong>7-9 hours of sleep</strong> per night for optimal recovery</li>
                    <li><strong>48-72 hours rest</strong> between training the same muscle group</li>
                    <li><strong>Adequate protein intake</strong> (1.6-2.2g per kg bodyweight)</li>
                    <li><strong>Caloric surplus</strong> of 200-300 calories for muscle growth</li>
                  </ul>
                </section>
              </article>
            )}

            {activeContent === 'fat-loss' && (
              <article className="rounded-2xl border border-white/10 bg-white/5 p-8">
                <h1 className="mb-6 text-4xl font-bold text-purple-400">Fat Loss Strategies</h1>

                <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-semibold text-purple-300">The Energy Balance Equation</h2>
                  <p className="mb-4 text-gray-300 leading-relaxed">
                    Fat loss fundamentally comes down to energy balance. To lose fat, you must create a <strong>caloric deficit</strong>—consuming fewer calories than you burn.
                  </p>
                  <div className="rounded-lg bg-purple-500/10 border border-purple-500/30 p-4 mb-4">
                    <p className="text-purple-300">
                      <strong>Caloric Deficit = Calories In &lt; Calories Out</strong>
                    </p>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    A deficit of <strong>300-500 calories per day</strong> typically results in sustainable fat loss of 0.5-1kg (1-2lbs) per week.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-semibold text-purple-300">Protein Preservation</h2>
                  <p className="mb-4 text-gray-300 leading-relaxed">
                    During fat loss, maintaining muscle mass is crucial. High protein intake helps:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-300">
                    <li>Preserve lean muscle mass during deficit</li>
                    <li>Increase satiety (feeling of fullness)</li>
                    <li>Higher thermic effect (burns more calories digesting)</li>
                    <li>Support recovery from training</li>
                  </ul>
                  <p className="mt-4 text-gray-300">
                    Target: <strong>2.0-2.4g protein per kg bodyweight</strong> during fat loss.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-semibold text-purple-300">Training During Fat Loss</h2>
                  <p className="mb-4 text-gray-300 leading-relaxed">
                    Maintain your strength training routine during a cut to signal your body to preserve muscle:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-300">
                    <li>Keep lifting heavy weights (progressive overload)</li>
                    <li>Maintain or slightly reduce training volume</li>
                    <li>Focus on compound movements</li>
                    <li>Add cardio for additional calorie burn (optional)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="mb-4 text-2xl font-semibold text-purple-300">Sustainable Approach</h2>
                  <p className="mb-4 text-gray-300 leading-relaxed">
                    Avoid extreme deficits and crash diets. Instead:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-300">
                    <li>Aim for 0.5-1% bodyweight loss per week</li>
                    <li>Take diet breaks every 8-12 weeks</li>
                    <li>Focus on whole, nutrient-dense foods</li>
                    <li>Stay hydrated (3-4L water per day)</li>
                    <li>Prioritize sleep and stress management</li>
                  </ul>
                </section>
              </article>
            )}

            {activeContent === 'nutrition' && (
              <article className="rounded-2xl border border-white/10 bg-white/5 p-8">
                <h1 className="mb-6 text-4xl font-bold text-green-400">Nutrition Fundamentals</h1>

                <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-semibold text-green-300">Macronutrients</h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-xl font-semibold text-green-200">Protein (4 cal/g)</h3>
                      <p className="text-gray-300 leading-relaxed">
                        Essential for muscle repair, growth, and countless bodily functions.
                      </p>
                      <p className="mt-2 text-sm text-green-300">Target: 1.6-2.2g per kg bodyweight</p>
                    </div>

                    <div>
                      <h3 className="mb-2 text-xl font-semibold text-green-200">Carbohydrates (4 cal/g)</h3>
                      <p className="text-gray-300 leading-relaxed">
                        Primary energy source for high-intensity training and brain function.
                      </p>
                      <p className="mt-2 text-sm text-green-300">Target: 3-5g per kg bodyweight (adjust based on activity)</p>
                    </div>

                    <div>
                      <h3 className="mb-2 text-xl font-semibold text-green-200">Fats (9 cal/g)</h3>
                      <p className="text-gray-300 leading-relaxed">
                        Critical for hormone production, vitamin absorption, and cellular health.
                      </p>
                      <p className="mt-2 text-sm text-green-300">Target: 0.8-1.2g per kg bodyweight</p>
                    </div>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-semibold text-green-300">Micronutrients</h2>
                  <p className="mb-4 text-gray-300 leading-relaxed">
                    Vitamins and minerals are essential for optimal health:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-300">
                    <li><strong>Vitamin D:</strong> Bone health, immune function, mood</li>
                    <li><strong>Iron:</strong> Oxygen transport, energy production</li>
                    <li><strong>Magnesium:</strong> Muscle function, sleep quality</li>
                    <li><strong>Zinc:</strong> Immune function, testosterone production</li>
                    <li><strong>Omega-3:</strong> Heart health, inflammation reduction</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-semibold text-green-300">Meal Timing</h2>
                  <p className="mb-4 text-gray-300 leading-relaxed">
                    While total daily intake matters most, optimal timing can enhance results:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-300">
                    <li><strong>Pre-workout:</strong> Carbs + protein 1-2 hours before training</li>
                    <li><strong>Post-workout:</strong> Protein within 2 hours after training</li>
                    <li><strong>Frequency:</strong> 3-5 meals per day for stable energy</li>
                    <li><strong>Protein distribution:</strong> 20-40g protein per meal</li>
                  </ul>
                </section>

                <section>
                  <h2 className="mb-4 text-2xl font-semibold text-green-300">Hydration</h2>
                  <p className="text-gray-300 leading-relaxed">
                    Water is crucial for performance and recovery:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-300 mt-4">
                    <li>Drink 3-4L of water daily</li>
                    <li>More during intense training or hot weather</li>
                    <li>Urine should be pale yellow</li>
                    <li>Electrolytes important during heavy sweating</li>
                  </ul>
                </section>
              </article>
            )}

            {activeContent === 'exercise' && (
              <article className="rounded-2xl border border-white/10 bg-white/5 p-8">
                <h1 className="mb-6 text-4xl font-bold text-orange-400">Exercise Science</h1>

                <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-semibold text-orange-300">Training Principles</h2>

                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-2 text-xl font-semibold text-orange-200">1. Specificity</h3>
                      <p className="text-gray-300">
                        Train specifically for your goals. Powerlifters lift heavy, endurance athletes train endurance, bodybuilders focus on hypertrophy.
                      </p>
                    </div>

                    <div>
                      <h3 className="mb-2 text-xl font-semibold text-orange-200">2. Progressive Overload</h3>
                      <p className="text-gray-300">
                        Gradually increase training demands to force adaptation and improvement.
                      </p>
                    </div>

                    <div>
                      <h3 className="mb-2 text-xl font-semibold text-orange-200">3. Recovery</h3>
                      <p className="text-gray-300">
                        Adaptations occur during rest. Balance training stress with adequate recovery.
                      </p>
                    </div>

                    <div>
                      <h3 className="mb-2 text-xl font-semibold text-orange-200">4. Variation</h3>
                      <p className="text-gray-300">
                        Periodically change exercises, intensity, and volume to prevent plateaus.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-semibold text-orange-300">Essential Compound Movements</h2>

                  <div className="space-y-4">
                    <div className="rounded-lg bg-orange-500/10 border border-orange-500/30 p-4">
                      <h3 className="mb-2 font-semibold text-orange-200">Squat</h3>
                      <p className="text-sm text-gray-300">
                        <strong>Targets:</strong> Quads, glutes, hamstrings, core<br />
                        <strong>Key:</strong> Depth to parallel or below, knees track over toes, chest up
                      </p>
                    </div>

                    <div className="rounded-lg bg-orange-500/10 border border-orange-500/30 p-4">
                      <h3 className="mb-2 font-semibold text-orange-200">Deadlift</h3>
                      <p className="text-sm text-gray-300">
                        <strong>Targets:</strong> Entire posterior chain, traps, forearms<br />
                        <strong>Key:</strong> Neutral spine, hinge at hips, bar close to body
                      </p>
                    </div>

                    <div className="rounded-lg bg-orange-500/10 border border-orange-500/30 p-4">
                      <h3 className="mb-2 font-semibold text-orange-200">Bench Press</h3>
                      <p className="text-sm text-gray-300">
                        <strong>Targets:</strong> Chest, front delts, triceps<br />
                        <strong>Key:</strong> Retract shoulder blades, arch back slightly, lower to chest
                      </p>
                    </div>

                    <div className="rounded-lg bg-orange-500/10 border border-orange-500/30 p-4">
                      <h3 className="mb-2 font-semibold text-orange-200">Rows</h3>
                      <p className="text-sm text-gray-300">
                        <strong>Targets:</strong> Lats, rhomboids, rear delts, biceps<br />
                        <strong>Key:</strong> Pull to lower chest/upper abdomen, squeeze shoulder blades
                      </p>
                    </div>

                    <div className="rounded-lg bg-orange-500/10 border border-orange-500/30 p-4">
                      <h3 className="mb-2 font-semibold text-orange-200">Overhead Press</h3>
                      <p className="text-sm text-gray-300">
                        <strong>Targets:</strong> Shoulders, triceps, upper chest<br />
                        <strong>Key:</strong> Core tight, press straight overhead, full lockout
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="mb-4 text-2xl font-semibold text-orange-300">Form Safety Tips</h2>
                  <ul className="list-disc pl-6 space-y-2 text-gray-300">
                    <li>Master form with lighter weights before progressing</li>
                    <li>Never sacrifice form for heavier weight</li>
                    <li>Use full range of motion for each exercise</li>
                    <li>Breathe properly: exhale on exertion, inhale on relaxation</li>
                    <li>Warm up with dynamic stretching and lighter sets</li>
                    <li>Listen to your body—pain is a warning sign</li>
                  </ul>
                </section>
              </article>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-20 border-t border-white/10 px-6 py-8">
        <div className="mx-auto max-w-7xl text-center text-sm text-gray-500">
          <p>© 2025 Istani Fitness. Powered by FREE AI & Science</p>
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

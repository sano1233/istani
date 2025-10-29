'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  activity_level?: number;
  fitness_goal?: 'lose_weight' | 'maintain' | 'gain_muscle' | 'athletic_performance';
}

interface GeneratedPlan {
  id: string;
  name: string;
  description: string;
  created_at: string;
  daily_calories?: number;
  exercises?: any;
  meals?: any;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'workout' | 'meal' | 'progress'>('profile');
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [workoutPlans, setWorkoutPlans] = useState<GeneratedPlan[]>([]);
  const [mealPlans, setMealPlans] = useState<GeneratedPlan[]>([]);
  const [message, setMessage] = useState('');
  const [ensembleLoading, setEnsembleLoading] = useState(false);
  const [flaggedInfo, setFlaggedInfo] = useState<{ flagged: boolean; reasons?: string[] } | null>(null);
  const isPlanFlagged = (text?: string) => {
    if (!text) return false;
    const t = text.toLowerCase();
    return t.includes('[unsafe-substance]') || t.includes('disclaimer: this ai-generated plan');
  };

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/auth');
      return;
    }

    setUser(user);

    // Fetch user profile
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
    }

    // Fetch workout plans
    const { data: workoutsData } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (workoutsData) setWorkoutPlans(workoutsData);

    // Fetch meal plans
    const { data: mealsData } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (mealsData) setMealPlans(mealsData);

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', user.id);

    if (error) {
      setMessage('Error updating profile: ' + error.message);
    } else {
      setMessage('Profile updated successfully!');
      checkUser();
    }
  };

  const generatePlan = async (planType: 'workout' | 'meal') => {
    if (!user || !profile) {
      setMessage('Please complete your profile first!');
      return;
    }

    if (!profile.age || !profile.gender || !profile.height || !profile.weight || !profile.activity_level || !profile.fitness_goal) {
      setMessage('Please fill in all profile fields to generate a plan!');
      setActiveTab('profile');
      return;
    }

    setGeneratingPlan(true);
    setMessage(`Generating your ${planType} plan with FREE AI...`);

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          planType,
          userProfile: {
            age: profile.age,
            gender: profile.gender,
            height: profile.height,
            weight: profile.weight,
            activityLevel: profile.activity_level,
            fitnessGoal: profile.fitness_goal,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ ${data.message}`);
        checkUser(); // Refresh plans
      } else {
        setMessage('❌ Error: ' + data.error);
      }
    } catch (error: any) {
      setMessage('❌ Error generating plan: ' + error.message);
    } finally {
      setGeneratingPlan(false);
    }
  };

  const generateEnsemble = async (planType: 'workout' | 'meal') => {
    if (!user || !profile) {
      setMessage('Please complete your profile first!');
      return;
    }
    if (!profile.age || !profile.gender || !profile.height || !profile.weight || !profile.activity_level || !profile.fitness_goal) {
      setMessage('Please fill in all profile fields to generate a plan!');
      setActiveTab('profile');
      return;
    }

    setEnsembleLoading(true);
    setFlaggedInfo(null);
    setMessage(`Running Claude + Gemini ensemble for your ${planType} plan...`);

    try {
      const res = await fetch('/api/ensemble-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          planType,
          userProfile: {
            age: profile.age,
            gender: profile.gender,
            height: profile.height,
            weight: profile.weight,
            activityLevel: profile.activity_level,
            fitnessGoal: profile.fitness_goal,
          },
        }),
      });
      const data = await res.json();
      if (data?.success) {
        setMessage('Ensemble plan generated successfully.');
        if (data.flagged) setFlaggedInfo({ flagged: true, reasons: data.reasons });
        checkUser();
      } else {
        setMessage('Error generating ensemble plan: ' + (data?.error || 'Unknown error'));
      }
    } catch (e: any) {
      setMessage('Error generating ensemble plan: ' + e.message);
    } finally {
      setEnsembleLoading(false);
    }
  };

  const generateMultiAgentPlan = async () => {
    if (!user || !profile) {
      setMessage('Please complete your profile first!');
      return;
    }

    if (!profile.age || !profile.gender || !profile.height || !profile.weight || !profile.activity_level || !profile.fitness_goal) {
      setMessage('Please fill in all profile fields to generate a plan!');
      setActiveTab('profile');
      return;
    }

    setGeneratingPlan(true);
    setMessage('🤖 Multi-agent system working: Planner → Exercise Specialist → Nutrition Expert → Quality Control...');

    try {
      const response = await fetch('/api/multi-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          goal: `Create complete fitness program for ${profile.fitness_goal}`,
          userProfile: {
            age: profile.age,
            gender: profile.gender,
            height: profile.height,
            weight: profile.weight,
            activityLevel: profile.activity_level,
            fitnessGoal: profile.fitness_goal,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ ${data.message}\n\n${Object.entries(data.agentDetails).map(([k, v]) => `• ${k}: ${v}`).join('\n')}`);
        checkUser(); // Refresh plans
      } else {
        setMessage('❌ Error: ' + data.error);
      }
    } catch (error: any) {
      setMessage('❌ Error generating multi-agent plan: ' + error.message);
    } finally {
      setGeneratingPlan(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-black to-purple-900 text-white">
        <div className="text-center">
          <div className="mb-4 text-4xl">💪</div>
          <p>Loading your fitness journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="text-2xl">💪</div>
              <span className="text-xl font-semibold tracking-tight">Istani Fitness</span>
            </a>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">{profile?.email}</span>
              <button
                onClick={handleLogout}
                className="rounded-full bg-red-600/20 px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-600/30"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Google AdSense */}
      <div className="mx-auto mt-20 max-w-7xl px-6 py-4">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT}
          data-ad-slot="auto"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Tabs */}
        <div className="mb-8 flex gap-4 overflow-x-auto border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`whitespace-nowrap px-4 py-2 font-semibold transition-colors ${
              activeTab === 'profile'
                ? 'border-b-2 border-purple-500 text-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            👤 Profile
          </button>
          <button
            onClick={() => setActiveTab('workout')}
            className={`whitespace-nowrap px-4 py-2 font-semibold transition-colors ${
              activeTab === 'workout'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🏋️ Workout Plans
          </button>
          <button
            onClick={() => setActiveTab('meal')}
            className={`whitespace-nowrap px-4 py-2 font-semibold transition-colors ${
              activeTab === 'meal'
                ? 'border-b-2 border-green-500 text-green-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🥗 Meal Plans
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`whitespace-nowrap px-4 py-2 font-semibold transition-colors ${
              activeTab === 'progress'
                ? 'border-b-2 border-orange-500 text-orange-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📈 Progress
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 rounded-lg p-4 ${
            message.includes('✅') || message.includes('success')
              ? 'bg-green-500/10 text-green-400 border border-green-500/30'
              : message.includes('❌')
              ? 'bg-red-500/10 text-red-400 border border-red-500/30'
              : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
          }`}>
            {message}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <h2 className="mb-6 text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Your Profile
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  value={profile?.full_name || ''}
                  onChange={(e) => setProfile({ ...profile!, full_name: e.target.value })}
                  onBlur={() => updateProfile({ full_name: profile?.full_name })}
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Age</label>
                <input
                  type="number"
                  value={profile?.age || ''}
                  onChange={(e) => setProfile({ ...profile!, age: parseInt(e.target.value) })}
                  onBlur={() => updateProfile({ age: profile?.age })}
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Gender</label>
                <select
                  value={profile?.gender || ''}
                  onChange={(e) => {
                    const gender = e.target.value as 'male' | 'female' | 'other';
                    setProfile({ ...profile!, gender });
                    updateProfile({ gender });
                  }}
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Height (cm)</label>
                <input
                  type="number"
                  value={profile?.height || ''}
                  onChange={(e) => setProfile({ ...profile!, height: parseFloat(e.target.value) })}
                  onBlur={() => updateProfile({ height: profile?.height })}
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Weight (kg)</label>
                <input
                  type="number"
                  value={profile?.weight || ''}
                  onChange={(e) => setProfile({ ...profile!, weight: parseFloat(e.target.value) })}
                  onBlur={() => updateProfile({ weight: profile?.weight })}
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Activity Level</label>
                <select
                  value={profile?.activity_level || 1.2}
                  onChange={(e) => {
                    const activity_level = parseFloat(e.target.value);
                    setProfile({ ...profile!, activity_level });
                    updateProfile({ activity_level });
                  }}
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="1.2">Sedentary</option>
                  <option value="1.375">Lightly Active</option>
                  <option value="1.55">Moderately Active</option>
                  <option value="1.725">Very Active</option>
                  <option value="1.9">Extremely Active</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">Fitness Goal</label>
                <select
                  value={profile?.fitness_goal || ''}
                  onChange={(e) => {
                    const fitness_goal = e.target.value as any;
                    setProfile({ ...profile!, fitness_goal });
                    updateProfile({ fitness_goal });
                  }}
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Select...</option>
                  <option value="lose_weight">Lose Weight</option>
                  <option value="maintain">Maintain Weight</option>
                  <option value="gain_muscle">Gain Muscle</option>
                  <option value="athletic_performance">Athletic Performance</option>
                </select>
              </div>
              <div className="mt-2">
                <button
                  onClick={() => generateEnsemble('workout')}
                  disabled={ensembleLoading}
                  className="rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-6 py-2 text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-indigo-500/50"
                >
                  {ensembleLoading ? 'Ensemble Running...' : 'Claude + Gemini Ensemble'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Workout Plans Tab */}
        {activeTab === 'workout' && (
          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Workout Plans
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => generatePlan('workout')}
                  disabled={generatingPlan}
                  className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/50"
                >
                  {generatingPlan ? '🤖 Generating...' : '✨ Quick Workout Plan'}
                </button>
                <button
                  onClick={generateMultiAgentPlan}
                  disabled={generatingPlan}
                  className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/50 relative"
                >
                  <span className="absolute -top-2 -right-2 rounded-full bg-yellow-500 px-2 py-1 text-xs font-bold text-black">
                    NEW
                  </span>
                  {generatingPlan ? '🤖 4 Agents Working...' : '🚀 Multi-Agent Plan'}
                </button>
              </div>
              <div className="mt-2">
                <button
                  onClick={() => generateEnsemble('meal')}
                  disabled={ensembleLoading}
                  className="rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-2 text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-teal-500/50"
                >
                  {ensembleLoading ? 'Ensemble Running...' : 'Claude + Gemini Ensemble'}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {workoutPlans.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
                  <div className="mb-4 text-6xl">🏋️</div>
                  <p className="text-xl text-gray-400">No workout plans yet</p>
                  <p className="mt-2 text-sm text-gray-500">Click the button above to generate your first plan!</p>
                </div>
              ) : (
                workoutPlans.map((plan) => (
                  <div key={plan.id} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-blue-400 flex items-center gap-2">
                          <span>{plan.name}</span>
                          {(isPlanFlagged(plan.description) || (plan as any)?.exercises?.[0]?.flagged) && (
                            <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-semibold text-yellow-300 border border-yellow-500/40">Safety flags</span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-400">
                          Created: {new Date(plan.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="whitespace-pre-wrap rounded-lg bg-black/30 p-4 text-sm">
                      {plan.description}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Meal Plans Tab */}
        {activeTab === 'meal' && (
          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Meal Plans
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => generatePlan('meal')}
                  disabled={generatingPlan}
                  className="rounded-full bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-green-500/50"
                >
                  {generatingPlan ? '🤖 Generating...' : '✨ Quick Meal Plan'}
                </button>
                <button
                  onClick={generateMultiAgentPlan}
                  disabled={generatingPlan}
                  className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/50 relative"
                >
                  <span className="absolute -top-2 -right-2 rounded-full bg-yellow-500 px-2 py-1 text-xs font-bold text-black">
                    NEW
                  </span>
                  {generatingPlan ? '🤖 4 Agents Working...' : '🚀 Multi-Agent Plan'}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {mealPlans.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
                  <div className="mb-4 text-6xl">🥗</div>
                  <p className="text-xl text-gray-400">No meal plans yet</p>
                  <p className="mt-2 text-sm text-gray-500">Click the button above to generate your first plan!</p>
                </div>
              ) : (
                mealPlans.map((plan) => (
                  <div key={plan.id} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-green-400 flex items-center gap-2">
                          <span>{plan.name}</span>
                          {(isPlanFlagged(plan.description) || (plan as any)?.meals?.[0]?.flagged) && (
                            <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-semibold text-yellow-300 border border-yellow-500/40">Safety flags</span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-400">
                          Created: {new Date(plan.created_at).toLocaleDateString()}
                          {plan.daily_calories && ` • ${plan.daily_calories} calories/day`}
                        </p>
                      </div>
                    </div>
                    <div className="whitespace-pre-wrap rounded-lg bg-black/30 p-4 text-sm">
                      {plan.description}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
            <div className="mb-4 text-6xl">📈</div>
            <h2 className="mb-4 text-3xl font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
              Progress Tracking
            </h2>
            <p className="text-xl text-gray-400">Coming Soon!</p>
            <p className="mt-2 text-sm text-gray-500">
              Track your weight, measurements, and see your transformation over time
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  age: number | null;
  gender: string | null;
  height_cm: number | null;
  current_weight_kg: number | null;
  target_weight_kg: number | null;
  activity_level: string | null;
  primary_goal: string | null;
  fitness_goals: string[] | null;
}

export function ProfileSettings({ profile, userId }: { profile: Profile | null; userId: string }) {
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [age, setAge] = useState(profile?.age?.toString() || '');
  const [gender, setGender] = useState(profile?.gender || 'male');
  const [heightCm, setHeightCm] = useState(profile?.height_cm?.toString() || '');
  const [activityLevel, setActivityLevel] = useState(profile?.activity_level || 'moderate');
  const [primaryGoal, setPrimaryGoal] = useState(profile?.primary_goal || 'maintain_weight');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName || null,
          age: age ? Number(age) : null,
          gender: gender,
          height_cm: heightCm ? Number(heightCm) : null,
          activity_level: activityLevel,
          primary_goal: primaryGoal,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-lg font-semibold mb-4">Profile Settings</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Age and Gender */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Age</label>
            <input
              type="number"
              min="13"
              max="120"
              value={age}
              onChange={e => setAge(e.target.value)}
              placeholder="25"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select
              value={gender}
              onChange={e => setGender(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Height */}
        <div>
          <label className="block text-sm font-medium mb-1">Height (cm)</label>
          <input
            type="number"
            min="100"
            max="250"
            value={heightCm}
            onChange={e => setHeightCm(e.target.value)}
            placeholder="175"
            className="w-full px-3 py-2 border rounded-lg"
          />
          {heightCm && (
            <div className="text-xs text-gray-500 mt-1">
              {(Number(heightCm) / 30.48).toFixed(1)} feet
            </div>
          )}
        </div>

        {/* Activity Level */}
        <div>
          <label className="block text-sm font-medium mb-1">Activity Level</label>
          <select
            value={activityLevel}
            onChange={e => setActivityLevel(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="sedentary">Sedentary (little to no exercise)</option>
            <option value="light">Light (1-3 days/week)</option>
            <option value="moderate">Moderate (3-5 days/week)</option>
            <option value="active">Active (6-7 days/week)</option>
            <option value="very_active">Very Active (physical job + training)</option>
          </select>
        </div>

        {/* Primary Goal */}
        <div>
          <label className="block text-sm font-medium mb-1">Primary Goal</label>
          <select
            value={primaryGoal}
            onChange={e => setPrimaryGoal(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="fat_loss">Fat Loss</option>
            <option value="muscle_gain">Muscle Gain</option>
            <option value="maintain_weight">Maintain Weight</option>
            <option value="improve_endurance">Improve Endurance</option>
            <option value="general_fitness">General Fitness</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {loading ? 'Saving...' : success ? '✅ Saved!' : 'Save Changes'}
        </button>

        {success && (
          <div className="text-center text-green-600 text-sm">
            Profile updated successfully! AI recommendations will be recalculated.
          </div>
        )}
      </form>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const WORKOUT_TYPES = [
  { value: 'strength', label: 'Strength Training', emoji: '💪' },
  { value: 'cardio', label: 'Cardio', emoji: '🏃' },
  { value: 'yoga', label: 'Yoga', emoji: '🧘' },
  { value: 'hiit', label: 'HIIT', emoji: '🔥' },
  { value: 'sports', label: 'Sports', emoji: '⚽' },
  { value: 'other', label: 'Other', emoji: '🎯' },
];

const EXERCISE_LIBRARY = {
  strength: [
    { name: 'Bench Press', muscleGroup: 'chest' },
    { name: 'Squat', muscleGroup: 'legs' },
    { name: 'Deadlift', muscleGroup: 'back' },
    { name: 'Overhead Press', muscleGroup: 'shoulders' },
    { name: 'Barbell Row', muscleGroup: 'back' },
    { name: 'Pull-ups', muscleGroup: 'back' },
    { name: 'Dips', muscleGroup: 'triceps' },
    { name: 'Bicep Curls', muscleGroup: 'biceps' },
    { name: 'Leg Press', muscleGroup: 'legs' },
    { name: 'Romanian Deadlift', muscleGroup: 'legs' },
  ],
  cardio: [
    { name: 'Running', muscleGroup: 'cardio' },
    { name: 'Cycling', muscleGroup: 'cardio' },
    { name: 'Swimming', muscleGroup: 'cardio' },
    { name: 'Rowing', muscleGroup: 'cardio' },
    { name: 'Jump Rope', muscleGroup: 'cardio' },
  ],
  hiit: [
    { name: 'Burpees', muscleGroup: 'full body' },
    { name: 'Mountain Climbers', muscleGroup: 'core' },
    { name: 'Jump Squats', muscleGroup: 'legs' },
    { name: 'High Knees', muscleGroup: 'cardio' },
    { name: 'Box Jumps', muscleGroup: 'legs' },
  ],
};

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight_kg: number;
  notes: string;
}

export function WorkoutLogger({ userId }: { userId: string }) {
  const [workoutType, setWorkoutType] = useState('strength');
  const [duration, setDuration] = useState(45);
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: '', sets: 3, reps: 10, weight_kg: 0, notes: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: 3, reps: 10, weight_kg: 0, notes: '' }]);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof Exercise, value: any) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      // Create workout
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: userId,
          workout_type: workoutType,
          duration_minutes: duration,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Add exercises if any
      const validExercises = exercises.filter((e) => e.name.trim() !== '');
      if (validExercises.length > 0) {
        const exerciseRecords = validExercises.map((ex) => ({
          workout_id: workout.id,
          exercise_name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight_kg: ex.weight_kg || null,
          notes: ex.notes || null,
        }));

        const { error: exerciseError } = await supabase
          .from('workout_exercises')
          .insert(exerciseRecords);

        if (exerciseError) throw exerciseError;
      }

      // Update workout streak
      const today = new Date().toISOString().split('T')[0];
      await supabase.rpc('update_user_streak', {
        p_user_id: userId,
        p_streak_type: 'workout',
        p_activity_date: today,
      });

      setSuccess(true);
      // Reset form
      setExercises([{ name: '', sets: 3, reps: 10, weight_kg: 0, notes: '' }]);
      setDuration(45);

      // Reload page after short delay to show updated stats
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      console.error('Error logging workout:', error);
      alert('Failed to log workout: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-xl font-semibold mb-4">Log Workout</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Workout Type */}
        <div>
          <label className="block text-sm font-medium mb-2">Workout Type</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {WORKOUT_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setWorkoutType(type.value)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  workoutType === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{type.emoji}</div>
                <div className="text-sm font-medium">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium mb-2">Duration: {duration} minutes</label>
          <input
            type="range"
            min="5"
            max="180"
            step="5"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Exercises */}
        {(workoutType === 'strength' || workoutType === 'hiit') && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium">Exercises</label>
              <button
                type="button"
                onClick={addExercise}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Add Exercise
              </button>
            </div>

            <div className="space-y-3">
              {exercises.map((exercise, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Exercise name"
                        value={exercise.name}
                        onChange={(e) => updateExercise(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        list={`exercises-${workoutType}`}
                      />
                      <datalist id={`exercises-${workoutType}`}>
                        {(EXERCISE_LIBRARY[workoutType as keyof typeof EXERCISE_LIBRARY] || []).map(
                          (ex) => (
                            <option key={ex.name} value={ex.name} />
                          ),
                        )}
                      </datalist>
                    </div>
                    {exercises.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExercise(index)}
                        className="text-red-500 hover:text-red-700 px-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-gray-600">Sets</label>
                      <input
                        type="number"
                        min="1"
                        value={exercise.sets}
                        onChange={(e) => updateExercise(index, 'sets', Number(e.target.value))}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Reps</label>
                      <input
                        type="number"
                        min="1"
                        value={exercise.reps}
                        onChange={(e) => updateExercise(index, 'reps', Number(e.target.value))}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Weight (kg)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={exercise.weight_kg}
                        onChange={(e) => updateExercise(index, 'weight_kg', Number(e.target.value))}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Notes (optional)"
                    value={exercise.notes}
                    onChange={(e) => updateExercise(index, 'notes', e.target.value)}
                    className="w-full px-3 py-1 border rounded text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {loading ? 'Logging Workout...' : success ? '✅ Workout Logged!' : '📝 Log Workout'}
        </button>

        {success && (
          <div className="text-center text-green-600 text-sm">
            Great work! Your workout has been logged and your streak updated.
          </div>
        )}
      </form>
    </div>
  );
}

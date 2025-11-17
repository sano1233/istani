'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function AIWorkoutGenerator() {
  const [loading, setLoading] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    goals: '',
    experience: 'intermediate',
    equipment: '',
    timeAvailable: '45',
  });

  const handleGenerate = async () => {
    setLoading(true);
    setWorkoutPlan(null);

    try {
      const response = await fetch('/api/ai/workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goals: formData.goals.split(',').map((g) => g.trim()),
          experience: formData.experience,
          equipment: formData.equipment.split(',').map((e) => e.trim()),
          timeAvailable: parseInt(formData.timeAvailable),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate workout plan');
      }

      setWorkoutPlan(data.workoutPlan);
    } catch (error: any) {
      alert(error.message || 'Failed to generate workout plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-white">AI Workout Generator</h2>
      </div>

      <p className="text-white/60 mb-6">
        Get a personalized workout plan powered by AI based on your goals and preferences
      </p>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Fitness Goals (comma-separated)
          </label>
          <Input
            placeholder="e.g., muscle gain, fat loss, strength"
            value={formData.goals}
            onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Experience Level</label>
          <select
            value={formData.experience}
            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Available Equipment (comma-separated)
          </label>
          <Input
            placeholder="e.g., dumbbells, barbell, resistance bands"
            value={formData.equipment}
            onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Time Available (minutes)
          </label>
          <Input
            type="number"
            placeholder="45"
            value={formData.timeAvailable}
            onChange={(e) => setFormData({ ...formData, timeAvailable: e.target.value })}
          />
        </div>
      </div>

      <Button onClick={handleGenerate} disabled={loading} size="lg" className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Workout Plan
          </>
        )}
      </Button>

      {workoutPlan && (
        <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-3">Your Workout Plan</h3>
          <div className="text-white/80 whitespace-pre-wrap">{workoutPlan}</div>
        </div>
      )}
    </Card>
  );
}

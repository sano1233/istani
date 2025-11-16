'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface DailyCheckInModalProps {
  userId: string;
  onClose: () => void;
}

export function DailyCheckInModal({ userId, onClose }: DailyCheckInModalProps) {
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [stressLevel, setStressLevel] = useState(3);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const moodEmojis = ['😢', '😕', '😐', '😊', '🤩'];
  const energyEmojis = ['😴', '😪', '😐', '💪', '⚡'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      // Insert check-in
      const { error } = await supabase.from('daily_checkins').insert({
        user_id: userId,
        mood_rating: mood,
        energy_level: energy,
        sleep_quality: sleepQuality,
        stress_level: stressLevel,
        notes: notes || null,
        checked_in_at: new Date().toISOString()
      });

      if (error) throw error;

      // Update check-in streak
      const today = new Date().toISOString().split('T')[0];
      await supabase.rpc('update_user_streak', {
        p_user_id: userId,
        p_streak_type: 'checkin',
        p_activity_date: today
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error('Error submitting check-in:', error);
      alert('Failed to submit check-in: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Daily Check-In</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            ×
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Take a moment to reflect on how you're feeling today. Your AI coach uses this data to
          personalize your recommendations.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mood */}
          <div>
            <label className="block text-sm font-medium mb-2">How's your mood today?</label>
            <div className="flex items-center justify-between gap-2">
              {moodEmojis.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setMood(index + 1)}
                  className={`text-4xl p-3 rounded-lg border-2 transition-all ${
                    mood === index + 1
                      ? 'border-blue-500 bg-blue-50 scale-110'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="text-xs text-center text-gray-500 mt-2">
              {['Very Bad', 'Bad', 'Neutral', 'Good', 'Excellent'][mood - 1]}
            </div>
          </div>

          {/* Energy Level */}
          <div>
            <label className="block text-sm font-medium mb-2">Energy level?</label>
            <div className="flex items-center justify-between gap-2">
              {energyEmojis.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setEnergy(index + 1)}
                  className={`text-4xl p-3 rounded-lg border-2 transition-all ${
                    energy === index + 1
                      ? 'border-green-500 bg-green-50 scale-110'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="text-xs text-center text-gray-500 mt-2">
              {['Exhausted', 'Low', 'Moderate', 'High', 'Peak'][energy - 1]}
            </div>
          </div>

          {/* Sleep Quality */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Sleep quality last night: {sleepQuality}/5
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={sleepQuality}
              onChange={e => setSleepQuality(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>

          {/* Stress Level */}
          <div>
            <label className="block text-sm font-medium mb-2">Stress level: {stressLevel}/5</label>
            <input
              type="range"
              min="1"
              max="5"
              value={stressLevel}
              onChange={e => setStressLevel(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">Any notes? (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="How are you feeling? Any goals for today?"
              className="w-full px-3 py-2 border rounded-lg resize-none"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Submitting...' : success ? '✅ Check-In Complete!' : '📝 Submit Check-In'}
          </button>

          {success && (
            <div className="text-center text-green-600 text-sm">
              Thank you! Your AI coach will use this to personalize your experience.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export function DailyCheckInTrigger({ userId }: { userId: string }) {
  const [showModal, setShowModal] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    // Check if user has checked in today
    const checkTodayCheckIn = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('daily_checkins')
        .select('id')
        .eq('user_id', userId)
        .gte('checked_in_at', today)
        .limit(1)
        .single();

      setHasCheckedIn(!!data);

      // Auto-show modal if not checked in and it's been 5 seconds
      if (!data) {
        setTimeout(() => setShowModal(true), 5000);
      }
    };

    checkTodayCheckIn();
  }, [userId, supabase]);

  if (hasCheckedIn) {
    return null;
  }

  return (
    <>
      {!showModal && (
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-6 right-6 bg-purple-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-purple-700 transition-all hover:scale-105 z-40"
        >
          📝 Daily Check-In
        </button>
      )}

      {showModal && <DailyCheckInModal userId={userId} onClose={() => setShowModal(false)} />}
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Habit {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  frequency: string;
  current_streak: number;
  longest_streak: number;
  total_completions: number;
  last_completed_date: string | null;
  target_count_per_day: number;
  tracking_type: string;
  unit: string;
  category: {
    name: string;
    icon: string;
    color: string;
  };
}

interface Completion {
  habit_id: string;
  completion_date: string;
  completed: boolean;
  count_value: number | null;
  mood: string | null;
}

interface StreakMilestone {
  milestone_days: number;
  achieved_date: string;
  celebration_message: string;
}

export function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<{ [key: string]: Completion }>({});
  const [milestones, setMilestones] = useState<StreakMilestone[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showMilestone, setShowMilestone] = useState<StreakMilestone | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadHabits();
    loadCompletions();
    loadMilestones();
  }, [selectedDate]);

  async function loadHabits() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_habits')
        .select(
          `
          *,
          category:category_id (name, icon, color)
        `
        )
        .eq('user_id', user.id)
        .eq('is_active', true)
        .eq('is_archived', false)
        .order('created_at', { ascending: true });

      if (data) {
        setHabits(
          data.map((h: any) => ({
            ...h,
            category: h.category || { name: 'General', icon: 'flag', color: '#6b7280' },
          }))
        );
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading habits:', error);
      setLoading(false);
    }
  }

  async function loadCompletions() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const dateStr = selectedDate.toISOString().split('T')[0];

      const { data } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('completion_date', dateStr);

      if (data) {
        const completionsMap: { [key: string]: Completion } = {};
        data.forEach((c: any) => {
          completionsMap[c.habit_id] = c;
        });
        setCompletions(completionsMap);
      }
    } catch (error) {
      console.error('Error loading completions:', error);
    }
  }

  async function loadMilestones() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Load recent milestones (last 7 days)
      const { data } = await supabase
        .from('habit_streak_milestones')
        .select('*')
        .eq('user_id', user.id)
        .gte('achieved_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('achieved_date', { ascending: false })
        .limit(5);

      if (data) {
        setMilestones(data);
        // Show most recent milestone as celebration
        if (data.length > 0 && !showMilestone) {
          setShowMilestone(data[0]);
          setTimeout(() => setShowMilestone(null), 5000);
        }
      }
    } catch (error) {
      console.error('Error loading milestones:', error);
    }
  }

  async function toggleHabit(habitId: string) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const dateStr = selectedDate.toISOString().split('T')[0];
      const isCompleted = completions[habitId]?.completed;

      if (isCompleted) {
        // Uncomplete
        await supabase
          .from('habit_completions')
          .delete()
          .eq('habit_id', habitId)
          .eq('completion_date', dateStr);
      } else {
        // Complete
        await supabase.from('habit_completions').insert({
          habit_id: habitId,
          user_id: user.id,
          completion_date: dateStr,
          completed: true,
        });
      }

      await loadHabits();
      await loadCompletions();
      await loadMilestones();
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  }

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const isToday = () => {
    const today = new Date();
    return selectedDate.toDateString() === today.toDateString();
  };

  const getCompletionRate = () => {
    if (habits.length === 0) return 0;
    const completed = Object.values(completions).filter((c) => c.completed).length;
    return Math.round((completed / habits.length) * 100);
  };

  const getTotalStreak = () => {
    return habits.reduce((sum, h) => sum + h.current_streak, 0);
  };

  const getStreakIcon = (streak: number) => {
    if (streak >= 365) return '👑';
    if (streak >= 100) return '💎';
    if (streak >= 30) return '🌟';
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '⭐';
    return '🎯';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="h-32 bg-white/10 rounded"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Milestone Celebration */}
      {showMilestone && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <Card className="p-6 bg-gradient-to-r from-primary/20 to-purple-500/20 border-primary">
            <div className="text-center">
              <p className="text-4xl mb-2">🎉</p>
              <p className="text-xl font-bold text-white mb-1">{showMilestone.celebration_message}</p>
              <p className="text-white/60 text-sm">
                Achieved on {new Date(showMilestone.achieved_date).toLocaleDateString()}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Habit Tracker</h1>
          <p className="text-white/60">Build lasting habits with streak tracking</p>
        </div>
        <Button>
          <span className="material-symbols-outlined mr-2">add</span>
          New Habit
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="material-symbols-outlined text-primary text-3xl">task_alt</span>
            <span className="text-3xl font-bold text-white">{getCompletionRate()}%</span>
          </div>
          <p className="text-white/60 text-sm">Today's Progress</p>
          <div className="w-full bg-white/10 rounded-full h-2 mt-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${getCompletionRate()}%` }}
            ></div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">🔥</span>
            <span className="text-3xl font-bold text-white">{getTotalStreak()}</span>
          </div>
          <p className="text-white/60 text-sm">Total Streak Days</p>
          <p className="text-white/40 text-xs mt-1">Across all habits</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="material-symbols-outlined text-green-500 text-3xl">
              check_circle
            </span>
            <span className="text-3xl font-bold text-white">{habits.length}</span>
          </div>
          <p className="text-white/60 text-sm">Active Habits</p>
          <p className="text-white/40 text-xs mt-1">Tracking daily</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="material-symbols-outlined text-yellow-500 text-3xl">
              emoji_events
            </span>
            <span className="text-3xl font-bold text-white">{milestones.length}</span>
          </div>
          <p className="text-white/60 text-sm">Recent Milestones</p>
          <p className="text-white/40 text-xs mt-1">Last 7 days</p>
        </Card>
      </div>

      {/* Date Navigator */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>

          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
            </p>
            <p className="text-white/60">{selectedDate.toLocaleDateString()}</p>
            {isToday() && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-primary/20 text-primary text-xs rounded">
                Today
              </span>
            )}
          </div>

          <button
            onClick={() => changeDate(1)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
            disabled={isToday()}
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </Card>

      {/* Habits Grid */}
      {habits.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-white/20 mb-4">
              check_circle
            </span>
            <h3 className="text-2xl font-bold text-white mb-2">No habits yet</h3>
            <p className="text-white/60 mb-6">Create your first habit to start tracking!</p>
            <Button>
              <span className="material-symbols-outlined mr-2">add</span>
              Create Habit
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((habit) => {
            const isCompleted = completions[habit.id]?.completed;

            return (
              <Card
                key={habit.id}
                className={`p-6 cursor-pointer transition-all ${
                  isCompleted
                    ? 'bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/50'
                    : 'hover:bg-white/5'
                }`}
                onClick={() => toggleHabit(habit.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                        isCompleted ? 'scale-110' : ''
                      }`}
                      style={{
                        backgroundColor: isCompleted ? habit.color + 'ff' : habit.color + '33',
                      }}
                    >
                      {isCompleted ? (
                        <span className="material-symbols-outlined text-white text-2xl">
                          check
                        </span>
                      ) : (
                        <span
                          className="material-symbols-outlined text-2xl"
                          style={{ color: habit.color }}
                        >
                          {habit.icon}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{habit.name}</h3>
                      <p className="text-white/60 text-sm">{habit.description}</p>
                    </div>
                  </div>
                </div>

                {/* Streak Display */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-sm">Current Streak</span>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl">{getStreakIcon(habit.current_streak)}</span>
                      <span className="text-2xl font-bold text-white">{habit.current_streak}</span>
                    </div>
                  </div>

                  {/* Streak Bar */}
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min((habit.current_streak / habit.longest_streak) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-white/40 text-xs">
                      Best: {habit.longest_streak} days
                    </span>
                    <span className="text-white/40 text-xs">
                      Total: {habit.total_completions}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm capitalize">{habit.frequency}</span>
                  {isCompleted ? (
                    <span className="flex items-center gap-1 text-green-400 text-sm font-semibold">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Completed
                    </span>
                  ) : (
                    <span className="text-white/40 text-sm">Tap to complete</span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Weekly Overview */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">This Week's Progress</h3>
        <div className="overflow-x-auto">
          <div className="flex gap-2">
            {[...Array(7)].map((_, dayIndex) => {
              const date = new Date(selectedDate);
              date.setDate(date.getDate() - date.getDay() + dayIndex);
              const dateStr = date.toISOString().split('T')[0];

              return (
                <div key={dayIndex} className="flex-1 min-w-[80px]">
                  <div className="text-center mb-2">
                    <p className="text-white/60 text-xs">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className="text-white font-semibold">{date.getDate()}</p>
                  </div>
                  <div className="space-y-1">
                    {habits.map((habit) => {
                      // Would need to load all week's completions for this
                      // For now, showing placeholder
                      return (
                        <div
                          key={habit.id}
                          className="h-2 rounded bg-white/10"
                          style={{
                            backgroundColor: dateStr === selectedDate.toISOString().split('T')[0] && completions[habit.id]?.completed
                              ? habit.color
                              : undefined,
                          }}
                        ></div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Recent Milestones */}
      {milestones.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">Recent Achievements</h3>
          <div className="space-y-3">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg border border-primary/20"
              >
                <div className="text-4xl">
                  {milestone.milestone_days >= 365 ? '👑' :
                   milestone.milestone_days >= 100 ? '💎' :
                   milestone.milestone_days >= 30 ? '🌟' :
                   milestone.milestone_days >= 7 ? '🔥' : '⭐'}
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">{milestone.celebration_message}</p>
                  <p className="text-white/60 text-sm">
                    {new Date(milestone.achieved_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart } from '@/components/analytics/line-chart';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: {
    name: string;
    icon: string;
    color: string;
  };
  metric_type: string;
  starting_value: number;
  target_value: number;
  current_value: number;
  unit: string;
  start_date: string;
  target_date: string;
  status: string;
  priority: string;
  progress_percentage: number;
  streak_days: number;
  best_streak: number;
  why_important: string;
  milestones: Milestone[];
}

interface Milestone {
  id: string;
  title: string;
  target_value: number;
  target_date: string;
  is_completed: boolean;
  order_index: number;
}

interface ProgressLog {
  log_date: string;
  value: number;
  notes: string;
  mood: string;
}

interface GoalTemplate {
  id: string;
  title: string;
  description: string;
  category: { name: string; icon: string; color: string };
  difficulty: string;
  typical_duration_weeks: number;
  success_rate: number;
}

export function GoalTracker() {
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'templates'>('active');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [templates, setTemplates] = useState<GoalTemplate[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadGoals();
    loadTemplates();
  }, [activeTab]);

  useEffect(() => {
    if (selectedGoal) {
      loadProgressLogs(selectedGoal.id);
    }
  }, [selectedGoal]);

  async function loadGoals() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const status = activeTab === 'completed' ? 'completed' : 'active';

      const { data } = await supabase
        .from('user_goals')
        .select(
          `
          *,
          category:category_id (name, icon, color),
          milestones:goal_milestones (*)
        `
        )
        .eq('user_id', user.id)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (data) {
        setGoals(
          data.map((g: any) => ({
            ...g,
            category: g.category || { name: 'General', icon: 'flag', color: '#6b7280' },
            milestones: (g.milestones || []).sort(
              (a: Milestone, b: Milestone) => a.order_index - b.order_index
            ),
          }))
        );
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading goals:', error);
      setLoading(false);
    }
  }

  async function loadTemplates() {
    try {
      const { data } = await supabase
        .from('goal_templates')
        .select(
          `
          *,
          category:category_id (name, icon, color)
        `
        )
        .order('popularity_score', { ascending: false })
        .limit(10);

      if (data) {
        setTemplates(
          data.map((t: any) => ({
            ...t,
            category: t.category || { name: 'General', icon: 'flag', color: '#6b7280' },
          }))
        );
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  }

  async function loadProgressLogs(goalId: string) {
    try {
      const { data } = await supabase
        .from('goal_progress_logs')
        .select('*')
        .eq('goal_id', goalId)
        .order('log_date', { ascending: true });

      if (data) {
        setProgressLogs(data);
      }
    } catch (error) {
      console.error('Error loading progress logs:', error);
    }
  }

  async function logProgress(goalId: string, value: number, notes: string, mood: string) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('goal_progress_logs').insert({
        goal_id: goalId,
        user_id: user.id,
        log_date: new Date().toISOString().split('T')[0],
        value,
        notes,
        mood,
      });

      if (!error) {
        await loadGoals();
        if (selectedGoal && selectedGoal.id === goalId) {
          await loadProgressLogs(goalId);
        }
      }
    } catch (error) {
      console.error('Error logging progress:', error);
    }
  }

  const getDaysRemaining = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      default:
        return 'bg-white/10 text-white/60 border-white/30';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'hard':
        return 'text-red-400';
      default:
        return 'text-white/60';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="h-40 bg-white/10 rounded"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (selectedGoal) {
    const chartData = progressLogs.map((log) => ({
      label: new Date(log.log_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: log.value,
    }));

    // Add target line
    if (chartData.length > 0) {
      chartData.push({
        label: new Date(selectedGoal.target_date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        value: selectedGoal.target_value,
      });
    }

    return (
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="outline" onClick={() => setSelectedGoal(null)}>
          <span className="material-symbols-outlined mr-2">arrow_back</span>
          Back to Goals
        </Button>

        {/* Goal Details */}
        <Card className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: selectedGoal.category.color + '33' }}
              >
                <span
                  className="material-symbols-outlined text-4xl"
                  style={{ color: selectedGoal.category.color }}
                >
                  {selectedGoal.category.icon}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{selectedGoal.title}</h1>
                <p className="text-white/60">{selectedGoal.description}</p>
                {selectedGoal.why_important && (
                  <p className="text-white/80 italic mt-2">
                    <span className="text-primary font-semibold">Why:</span>{' '}
                    {selectedGoal.why_important}
                  </p>
                )}
              </div>
            </div>

            <span className={`px-3 py-1 rounded border ${getPriorityColor(selectedGoal.priority)}`}>
              {selectedGoal.priority} priority
            </span>
          </div>

          {/* Progress Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <p className="text-3xl font-bold text-primary">{selectedGoal.progress_percentage.toFixed(0)}%</p>
              <p className="text-white/60 text-sm">Progress</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <p className="text-3xl font-bold text-white">{selectedGoal.current_value}</p>
              <p className="text-white/60 text-sm">Current</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <p className="text-3xl font-bold text-white">{selectedGoal.target_value}</p>
              <p className="text-white/60 text-sm">Target</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <p className="text-3xl font-bold text-yellow-400">{selectedGoal.streak_days}</p>
              <p className="text-white/60 text-sm">Day Streak</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <p className="text-3xl font-bold text-white">{getDaysRemaining(selectedGoal.target_date)}</p>
              <p className="text-white/60 text-sm">Days Left</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-white/10 rounded-full h-4">
              <div
                className="bg-primary h-4 rounded-full transition-all relative"
                style={{ width: `${Math.min(selectedGoal.progress_percentage, 100)}%` }}
              >
                <span className="absolute -right-2 -top-8 bg-primary px-2 py-1 rounded text-xs font-bold">
                  {selectedGoal.progress_percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Progress Over Time</h3>
              <LineChart data={chartData} height={250} color={selectedGoal.category.color} />
            </div>
          )}

          {/* Milestones */}
          {selectedGoal.milestones.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Milestones</h3>
              <div className="space-y-3">
                {selectedGoal.milestones.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      milestone.is_completed
                        ? 'bg-green-500/10 border-green-500/50'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        milestone.is_completed ? 'bg-green-500' : 'bg-white/20'
                      }`}
                    >
                      {milestone.is_completed ? (
                        <span className="material-symbols-outlined text-white text-lg">check</span>
                      ) : (
                        <span className="text-white font-bold">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">{milestone.title}</p>
                      <p className="text-white/60 text-sm">
                        Target: {milestone.target_value} {selectedGoal.unit}
                        {milestone.target_date &&
                          ` by ${new Date(milestone.target_date).toLocaleDateString()}`}
                      </p>
                    </div>
                    {milestone.is_completed && (
                      <span className="text-green-400 text-sm">✓ Completed</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Log Progress */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Log Today's Progress</h3>
            <div className="flex gap-4">
              <input
                type="number"
                placeholder={`Enter value (${selectedGoal.unit})`}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                id="progress-value"
              />
              <input
                type="text"
                placeholder="Notes (optional)"
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                id="progress-notes"
              />
              <select
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                id="progress-mood"
              >
                <option value="great">😊 Great</option>
                <option value="good">🙂 Good</option>
                <option value="okay">😐 Okay</option>
                <option value="bad">☹️ Bad</option>
                <option value="terrible">😢 Terrible</option>
              </select>
              <Button
                onClick={() => {
                  const valueInput = document.getElementById('progress-value') as HTMLInputElement;
                  const notesInput = document.getElementById('progress-notes') as HTMLInputElement;
                  const moodSelect = document.getElementById('progress-mood') as HTMLSelectElement;

                  if (valueInput.value) {
                    logProgress(
                      selectedGoal.id,
                      parseFloat(valueInput.value),
                      notesInput.value,
                      moodSelect.value
                    );

                    valueInput.value = '';
                    notesInput.value = '';
                  }
                }}
              >
                Log Progress
              </Button>
            </div>
          </div>
        </Card>

        {/* Recent Logs */}
        {progressLogs.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Progress Logs</h3>
            <div className="space-y-3">
              {progressLogs
                .slice(-10)
                .reverse()
                .map((log) => (
                  <div
                    key={log.log_date}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div>
                      <p className="text-white font-semibold">
                        {log.value} {selectedGoal.unit}
                      </p>
                      <p className="text-white/60 text-sm">
                        {new Date(log.log_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      {log.notes && <p className="text-white/80 text-sm italic mt-1">{log.notes}</p>}
                    </div>
                    <div className="text-2xl">
                      {log.mood === 'great' && '😊'}
                      {log.mood === 'good' && '🙂'}
                      {log.mood === 'okay' && '😐'}
                      {log.mood === 'bad' && '☹️'}
                      {log.mood === 'terrible' && '😢'}
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Goal Tracker</h1>
          <p className="text-white/60">Set and achieve your fitness goals with SMART goal tracking</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <span className="material-symbols-outlined mr-2">add</span>
          New Goal
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {['active', 'completed', 'templates'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 font-semibold capitalize transition-colors ${
              activeTab === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-white/60 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Active/Completed Goals */}
      {(activeTab === 'active' || activeTab === 'completed') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.length === 0 ? (
            <Card className="col-span-full p-12">
              <div className="text-center">
                <span className="material-symbols-outlined text-6xl text-white/20 mb-4">
                  flag
                </span>
                <h3 className="text-2xl font-bold text-white mb-2">
                  No {activeTab} goals yet
                </h3>
                <p className="text-white/60 mb-6">
                  {activeTab === 'active'
                    ? 'Create your first goal to start tracking progress!'
                    : 'Complete some goals to see them here!'}
                </p>
                {activeTab === 'active' && (
                  <Button onClick={() => setShowCreateModal(true)}>
                    <span className="material-symbols-outlined mr-2">add</span>
                    Create Goal
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            goals.map((goal) => (
              <Card
                key={goal.id}
                className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setSelectedGoal(goal)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: goal.category.color + '33' }}
                  >
                    <span
                      className="material-symbols-outlined text-2xl"
                      style={{ color: goal.category.color }}
                    >
                      {goal.category.icon}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs border ${getPriorityColor(goal.priority)}`}>
                    {goal.priority}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{goal.title}</h3>
                <p className="text-white/60 text-sm mb-4 line-clamp-2">{goal.description}</p>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-white/60">Progress</span>
                    <span className="text-primary font-semibold">
                      {goal.progress_percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(goal.progress_percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center">
                    <p className="text-white font-semibold">{goal.current_value}</p>
                    <p className="text-white/60 text-xs">Current</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-semibold">{goal.target_value}</p>
                    <p className="text-white/60 text-xs">Target</p>
                  </div>
                  <div className="text-center">
                    <p className="text-yellow-400 font-semibold">{goal.streak_days}</p>
                    <p className="text-white/60 text-xs">Streak</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">
                    {getDaysRemaining(goal.target_date)} days left
                  </span>
                  <span className="text-white/60">
                    {new Date(goal.target_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Templates */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: template.category.color + '33' }}
                >
                  <span
                    className="material-symbols-outlined text-2xl"
                    style={{ color: template.category.color }}
                  >
                    {template.category.icon}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">{template.title}</h3>
                  <p className="text-white/60 text-sm">{template.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-white/60">
                    <span className={getDifficultyColor(template.difficulty)}>●</span>{' '}
                    {template.difficulty}
                  </span>
                  <span className="text-white/60">{template.typical_duration_weeks} weeks</span>
                  <span className="text-green-400">{template.success_rate}% success</span>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                Use Template
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

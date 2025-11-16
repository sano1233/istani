'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface Achievement {
  id: string;
  completed: boolean;
  earned_at: string;
  achievements: {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    points: number;
  };
}

interface AchievementsListProps {
  achievements: Achievement[];
}

export function AchievementsList({ achievements }: AchievementsListProps) {
  const totalPoints = achievements.reduce((sum, a) => sum + a.achievements.points, 0);

  const categoryColors: Record<string, string> = {
    workout: 'text-fitness-strength',
    water: 'text-primary',
    nutrition: 'text-fitness-nutrition',
    progress: 'text-fitness-cardio',
    checkin: 'text-fitness-flexibility',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Achievements</CardTitle>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{totalPoints}</p>
            <p className="text-sm text-white/60">Total Points</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {achievements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-white/40">
            <span className="material-symbols-outlined text-6xl mb-4 opacity-40">emoji_events</span>
            <p className="text-lg mb-2">No achievements yet</p>
            <p className="text-sm">Start your fitness journey to unlock achievements</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => {
              const ach = achievement.achievements;
              const color = categoryColors[ach.category] || 'text-white';

              return (
                <div
                  key={achievement.id}
                  className="flex items-start gap-4 p-4 bg-white/5 border border-primary/20 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div
                    className={`w-12 h-12 flex items-center justify-center rounded-full bg-white/10 flex-shrink-0 ${color}`}
                  >
                    <span className="material-symbols-outlined text-2xl">{ach.icon}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-white truncate">{ach.name}</h4>
                      <span className="text-primary font-bold text-sm flex-shrink-0">
                        +{ach.points}
                      </span>
                    </div>
                    <p className="text-sm text-white/60 mb-2">{ach.description}</p>
                    <p className="text-xs text-white/40">
                      Earned{' '}
                      {new Date(achievement.earned_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AnalyticsCharts from '@/components/analytics-charts';
import AnalyticsService, { type UserAnalytics } from '@/lib/analytics';
import DataExporter from '@/lib/data-export';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock user ID - in production, get from auth context
  const userId = 'mock-user-id';

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await AnalyticsService.getUserAnalytics(userId, 30);
      setAnalytics(data);
      setInsights(AnalyticsService.generateInsights(data));
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json' | 'pdf') => {
    try {
      const blob = await AnalyticsService.exportAnalytics(userId, format, 90);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export analytics:', error);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track your progress and gain insights into your fitness journey
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
            Export JSON
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
            Export PDF
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Current Streak</CardDescription>
              <CardTitle className="text-3xl">{analytics.streak_days} days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Keep it up! 🔥
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Workouts</CardDescription>
              <CardTitle className="text-3xl">{analytics.total_workouts}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Last 30 days
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Meals Logged</CardDescription>
              <CardTitle className="text-3xl">{analytics.total_meals_logged}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Last 30 days
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Days</CardDescription>
              <CardTitle className="text-3xl">{analytics.active_days_30d}/30</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {((analytics.active_days_30d / 30) * 100).toFixed(0)}% consistency
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Insights & Achievements</CardTitle>
            <CardDescription>Key highlights from your recent activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className="p-3 bg-muted/50 rounded-lg text-sm"
                >
                  {insight}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Stats */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Nutrition</CardTitle>
              <CardDescription>Daily averages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Calories:</span>
                <span className="font-medium">{analytics.avg_daily_calories.toFixed(0)} kcal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Protein:</span>
                <span className="font-medium">{analytics.avg_daily_protein.toFixed(0)}g</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Weight Change:</span>
                <span
                  className={`font-medium ${
                    analytics.weight_change_30d < 0 ? 'text-green-500' : 'text-blue-500'
                  }`}
                >
                  {analytics.weight_change_30d > 0 ? '+' : ''}
                  {analytics.weight_change_30d.toFixed(1)} lbs
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social</CardTitle>
              <CardDescription>Community engagement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Friends:</span>
                <span className="font-medium">{analytics.friends_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Challenges:</span>
                <span className="font-medium">{analytics.challenges_completed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Achievements:</span>
                <span className="font-medium">{analytics.achievements_unlocked}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <AnalyticsCharts userId={userId} />
    </div>
  );
}

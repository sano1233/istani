/**
 * Analytics and Metrics System
 * Track user behavior, performance metrics, and business KPIs
 */

export interface UserAnalytics {
  user_id: string;
  total_workouts: number;
  total_meals_logged: number;
  streak_days: number;
  avg_daily_calories: number;
  avg_daily_protein: number;
  weight_change_30d: number;
  active_days_30d: number;
  achievements_unlocked: number;
  friends_count: number;
  challenges_completed: number;
}

export interface WorkoutMetrics {
  date: string;
  workout_count: number;
  total_duration: number;
  total_calories: number;
  avg_intensity: number;
  workout_types: Record<string, number>;
}

export interface NutritionMetrics {
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  meal_count: number;
  water_intake: number;
  compliance_score: number; // % of days hitting macro targets
}

export interface BodyMetrics {
  date: string;
  weight: number;
  body_fat_percentage?: number;
  muscle_mass?: number;
  bmi: number;
}

export interface EngagementMetrics {
  date: string;
  active_users: number;
  new_signups: number;
  daily_active_users: number;
  weekly_active_users: number;
  monthly_active_users: number;
  avg_session_duration: number;
  retention_rate: number;
}

export interface RevenueMetrics {
  date: string;
  total_revenue: number;
  new_subscriptions: number;
  churned_subscriptions: number;
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  ltv: number; // Customer Lifetime Value
  cac: number; // Customer Acquisition Cost
}

export class AnalyticsService {
  /**
   * Get comprehensive user analytics
   */
  static async getUserAnalytics(userId: string, timeRange: number = 30): Promise<UserAnalytics> {
    try {
      const response = await fetch(`/api/analytics/user?user_id=${userId}&days=${timeRange}`);
      if (!response.ok) throw new Error('Failed to fetch user analytics');
      return response.json();
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      throw error;
    }
  }

  /**
   * Get workout metrics over time
   */
  static async getWorkoutMetrics(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<WorkoutMetrics[]> {
    try {
      const params = new URLSearchParams({
        user_id: userId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });

      const response = await fetch(`/api/analytics/workouts?${params}`);
      if (!response.ok) throw new Error('Failed to fetch workout metrics');
      const data = await response.json();
      return data.metrics || [];
    } catch (error) {
      console.error('Error fetching workout metrics:', error);
      return [];
    }
  }

  /**
   * Get nutrition metrics over time
   */
  static async getNutritionMetrics(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<NutritionMetrics[]> {
    try {
      const params = new URLSearchParams({
        user_id: userId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });

      const response = await fetch(`/api/analytics/nutrition?${params}`);
      if (!response.ok) throw new Error('Failed to fetch nutrition metrics');
      const data = await response.json();
      return data.metrics || [];
    } catch (error) {
      console.error('Error fetching nutrition metrics:', error);
      return [];
    }
  }

  /**
   * Get body metrics over time
   */
  static async getBodyMetrics(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<BodyMetrics[]> {
    try {
      const params = new URLSearchParams({
        user_id: userId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });

      const response = await fetch(`/api/analytics/body?${params}`);
      if (!response.ok) throw new Error('Failed to fetch body metrics');
      const data = await response.json();
      return data.metrics || [];
    } catch (error) {
      console.error('Error fetching body metrics:', error);
      return [];
    }
  }

  /**
   * Get platform engagement metrics (admin only)
   */
  static async getEngagementMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<EngagementMetrics[]> {
    try {
      const params = new URLSearchParams({
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });

      const response = await fetch(`/api/analytics/engagement?${params}`);
      if (!response.ok) throw new Error('Failed to fetch engagement metrics');
      const data = await response.json();
      return data.metrics || [];
    } catch (error) {
      console.error('Error fetching engagement metrics:', error);
      return [];
    }
  }

  /**
   * Get revenue metrics (admin only)
   */
  static async getRevenueMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<RevenueMetrics[]> {
    try {
      const params = new URLSearchParams({
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });

      const response = await fetch(`/api/analytics/revenue?${params}`);
      if (!response.ok) throw new Error('Failed to fetch revenue metrics');
      const data = await response.json();
      return data.metrics || [];
    } catch (error) {
      console.error('Error fetching revenue metrics:', error);
      return [];
    }
  }

  /**
   * Calculate progress towards goals
   */
  static calculateGoalProgress(
    current: number,
    target: number,
    startValue?: number
  ): {
    percentage: number;
    remaining: number;
    isOnTrack: boolean;
    projectedCompletion?: Date;
  } {
    const percentage = Math.min(100, (current / target) * 100);
    const remaining = Math.max(0, target - current);
    const isOnTrack = percentage >= 50; // Simplified logic

    return {
      percentage,
      remaining,
      isOnTrack,
    };
  }

  /**
   * Generate insights from analytics data
   */
  static generateInsights(analytics: UserAnalytics): string[] {
    const insights: string[] = [];

    if (analytics.streak_days >= 7) {
      insights.push(`🔥 Amazing! You've maintained a ${analytics.streak_days}-day streak!`);
    }

    if (analytics.active_days_30d >= 20) {
      insights.push('💪 You have been highly consistent this month with 20+ active days!');
    }

    if (analytics.weight_change_30d < -2) {
      insights.push(`📉 You've lost ${Math.abs(analytics.weight_change_30d).toFixed(1)} lbs this month!`);
    } else if (analytics.weight_change_30d > 2) {
      insights.push(`📈 You've gained ${analytics.weight_change_30d.toFixed(1)} lbs this month!`);
    }

    if (analytics.avg_daily_protein >= 100) {
      insights.push('🥩 Great protein intake! Keep it up for muscle growth.');
    }

    if (analytics.achievements_unlocked > 5) {
      insights.push(`🏆 You've unlocked ${analytics.achievements_unlocked} achievements!`);
    }

    if (analytics.friends_count >= 10) {
      insights.push('👥 You are building a strong fitness community!');
    }

    return insights;
  }

  /**
   * Export analytics data
   */
  static async exportAnalytics(
    userId: string,
    format: 'csv' | 'json' | 'pdf',
    timeRange: number = 90
  ): Promise<Blob> {
    try {
      const params = new URLSearchParams({
        user_id: userId,
        format,
        days: timeRange.toString(),
      });

      const response = await fetch(`/api/analytics/export?${params}`);
      if (!response.ok) throw new Error('Failed to export analytics');

      return response.blob();
    } catch (error) {
      console.error('Error exporting analytics:', error);
      throw error;
    }
  }

  /**
   * Track custom event
   */
  static async trackEvent(
    eventName: string,
    properties?: Record<string, any>
  ): Promise<void> {
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: eventName,
          properties: {
            ...properties,
            timestamp: new Date().toISOString(),
            url: typeof window !== 'undefined' ? window.location.href : undefined,
          },
        }),
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }
}

export default AnalyticsService;

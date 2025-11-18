/**
 * Settings Management
 * User preferences, account settings, and customization options
 */

export interface UserSettings {
  // Profile Settings
  profile: {
    full_name: string;
    email: string;
    avatar_url?: string;
    bio?: string;
    location?: string;
    timezone: string;
    date_of_birth?: string;
  };

  // Fitness Settings
  fitness: {
    fitness_goal: string;
    activity_level: string;
    workout_days_per_week: number;
    daily_calorie_target: number;
    macro_targets: {
      protein_percentage: number;
      carbs_percentage: number;
      fat_percentage: number;
    };
  };

  // Nutrition Settings
  nutrition: {
    dietary_preference: string;
    allergies: string[];
    favorite_foods: string[];
    disliked_foods: string[];
    meal_reminder_times: {
      breakfast?: string;
      lunch?: string;
      dinner?: string;
      snack?: string;
    };
  };

  // Notification Settings
  notifications: {
    push_enabled: boolean;
    email_enabled: boolean;
    sms_enabled: boolean;
    preferences: {
      workout_reminders: boolean;
      meal_reminders: boolean;
      progress_updates: boolean;
      friend_activity: boolean;
      challenges: boolean;
      achievements: boolean;
      marketing: boolean;
    };
    quiet_hours: {
      enabled: boolean;
      start_time?: string;
      end_time?: string;
    };
  };

  // Privacy Settings
  privacy: {
    profile_visibility: 'public' | 'friends' | 'private';
    show_activity_feed: boolean;
    show_workout_stats: boolean;
    show_body_measurements: boolean;
    allow_friend_requests: boolean;
    allow_challenge_invites: boolean;
    data_sharing: {
      analytics: boolean;
      research: boolean;
      third_party: boolean;
    };
  };

  // Display Settings
  display: {
    theme: 'light' | 'dark' | 'auto';
    color_scheme: string;
    measurement_system: 'imperial' | 'metric';
    language: string;
    date_format: string;
    time_format: '12h' | '24h';
    show_animations: boolean;
    compact_mode: boolean;
  };

  // AI Settings
  ai: {
    features_enabled: boolean;
    photo_recognition: boolean;
    voice_assistant: boolean;
    smart_suggestions: boolean;
    auto_tracking: boolean;
    personalized_insights: boolean;
  };

  // Connected Devices
  devices: {
    connected_services: string[];
    auto_sync: boolean;
    sync_frequency: 'realtime' | 'hourly' | 'daily';
  };

  // Account Settings
  account: {
    two_factor_enabled: boolean;
    session_timeout: number; // minutes
    login_history_enabled: boolean;
  };
}

export class SettingsService {
  /**
   * Get user settings
   */
  static async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const response = await fetch(`/api/settings?user_id=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    } catch (error) {
      console.error('Error fetching settings:', error);
      return null;
    }
  }

  /**
   * Update user settings
   */
  static async updateSettings(
    userId: string,
    section: keyof UserSettings,
    updates: Partial<UserSettings[keyof UserSettings]>
  ): Promise<void> {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          section,
          updates,
        }),
      });

      if (!response.ok) throw new Error('Failed to update settings');
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }

  /**
   * Reset settings to defaults
   */
  static async resetSettings(userId: string, section?: keyof UserSettings): Promise<void> {
    try {
      const response = await fetch('/api/settings/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          section,
        }),
      });

      if (!response.ok) throw new Error('Failed to reset settings');
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw error;
    }
  }

  /**
   * Export user settings
   */
  static async exportSettings(userId: string): Promise<Blob> {
    try {
      const settings = await this.getUserSettings(userId);
      const blob = new Blob([JSON.stringify(settings, null, 2)], {
        type: 'application/json',
      });
      return blob;
    } catch (error) {
      console.error('Error exporting settings:', error);
      throw error;
    }
  }

  /**
   * Import user settings
   */
  static async importSettings(userId: string, settingsFile: File): Promise<void> {
    try {
      const text = await settingsFile.text();
      const settings = JSON.parse(text);

      const response = await fetch('/api/settings/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          settings,
        }),
      });

      if (!response.ok) throw new Error('Failed to import settings');
    } catch (error) {
      console.error('Error importing settings:', error);
      throw error;
    }
  }

  /**
   * Delete user account
   */
  static async deleteAccount(userId: string, password: string): Promise<void> {
    try {
      const response = await fetch('/api/settings/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          password,
        }),
      });

      if (!response.ok) throw new Error('Failed to delete account');
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const response = await fetch('/api/settings/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (!response.ok) throw new Error('Failed to change password');
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  /**
   * Enable/disable two-factor authentication
   */
  static async toggleTwoFactor(userId: string, enabled: boolean): Promise<void> {
    try {
      const response = await fetch('/api/settings/two-factor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          enabled,
        }),
      });

      if (!response.ok) throw new Error('Failed to toggle 2FA');
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      throw error;
    }
  }

  /**
   * Get default settings
   */
  static getDefaultSettings(): UserSettings {
    return {
      profile: {
        full_name: '',
        email: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      fitness: {
        fitness_goal: 'general_fitness',
        activity_level: 'moderately_active',
        workout_days_per_week: 3,
        daily_calorie_target: 2000,
        macro_targets: {
          protein_percentage: 25,
          carbs_percentage: 45,
          fat_percentage: 30,
        },
      },
      nutrition: {
        dietary_preference: 'none',
        allergies: [],
        favorite_foods: [],
        disliked_foods: [],
        meal_reminder_times: {},
      },
      notifications: {
        push_enabled: true,
        email_enabled: true,
        sms_enabled: false,
        preferences: {
          workout_reminders: true,
          meal_reminders: true,
          progress_updates: true,
          friend_activity: true,
          challenges: true,
          achievements: true,
          marketing: false,
        },
        quiet_hours: {
          enabled: false,
        },
      },
      privacy: {
        profile_visibility: 'friends',
        show_activity_feed: true,
        show_workout_stats: true,
        show_body_measurements: false,
        allow_friend_requests: true,
        allow_challenge_invites: true,
        data_sharing: {
          analytics: true,
          research: false,
          third_party: false,
        },
      },
      display: {
        theme: 'auto',
        color_scheme: 'default',
        measurement_system: 'imperial',
        language: 'en',
        date_format: 'MM/DD/YYYY',
        time_format: '12h',
        show_animations: true,
        compact_mode: false,
      },
      ai: {
        features_enabled: true,
        photo_recognition: true,
        voice_assistant: true,
        smart_suggestions: true,
        auto_tracking: false,
        personalized_insights: true,
      },
      devices: {
        connected_services: [],
        auto_sync: true,
        sync_frequency: 'hourly',
      },
      account: {
        two_factor_enabled: false,
        session_timeout: 60,
        login_history_enabled: true,
      },
    };
  }
}

export default SettingsService;

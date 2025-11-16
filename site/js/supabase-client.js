/**
 * Supabase Configuration for Istani Fitness Platform
 *
 * Autonomous fitness platform with:
 * - User management & authentication
 * - Workout & nutrition tracking
 * - Lead generation & email automation
 * - Exclusive coaching (Hormozi model)
 * - Donation integration
 */

// Supabase credentials (from environment or direct config)
const SUPABASE_CONFIG = {
  projectId: 'kxsmgrlpojdsgvjdodda',
  url: 'https://kxsmgrlpojdsgvjdodda.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4c21ncmxwb2pkc2d2amRvZGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNjQ2MjEsImV4cCI6MjA3NTY0MDYyMX0.AUiGtq9JrkFWwzm4cN6XE3ldOXUv7tSuKm0O5Oo74sw',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4c21ncmxwb2pkc2d2amRvZGRhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDA2NDYyMSwiZXhwIjoyMDc1NjQwNjIxfQ.6a5eSOaxQyl_GVXyKhnT45qn2ws-xUT5qYB5eeQooME'
};

// Initialize Supabase client (browser)
function initSupabaseClient() {
  if (typeof window === 'undefined') return null;

  // Load Supabase from CDN
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  script.onload = () => {
    window.supabaseClient = supabase.createClient(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.anonKey
    );
  };
  document.head.appendChild(script);
}

// API wrapper for common operations
const SupabaseAPI = {
  // Lead Generation
  async captureEmailLead(email, fullName, source, interests = []) {
    const { data, error } = await window.supabaseClient
      .from('leads')
      .insert({
        email,
        full_name: fullName,
        signup_source: source,
        interests
      })
      .select()
      .single();

    if (error) throw error;

    // Track analytics event
    await this.trackEvent('signup', { email, source });

    return data;
  },

  // User Signup
  async signupUser(email, password, fullName) {
    const { data: authData, error: authError } = await window.supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });

    if (authError) throw authError;

    // Create user profile
    const { data: userData, error: userError } = await window.supabaseClient
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName
      })
      .select()
      .single();

    if (userError) throw userError;

    return { auth: authData, user: userData };
  },

  // Workout Tracking
  async logWorkout(userId, programId, exercises, durationMinutes, caloriesBurned) {
    const { data, error } = await window.supabaseClient
      .from('workout_sessions')
      .insert({
        user_id: userId,
        program_id: programId,
        workout_date: new Date().toISOString().split('T')[0],
        duration_minutes: durationMinutes,
        calories_burned: caloriesBurned,
        exercises,
        completed: true
      })
      .select()
      .single();

    if (error) throw error;

    await this.trackEvent('workout_complete', { userId, duration: durationMinutes });

    return data;
  },

  // Nutrition Tracking
  async logMeal(userId, mealType, foods, calories, macros) {
    const { data, error } = await window.supabaseClient
      .from('meals')
      .insert({
        user_id: userId,
        meal_date: new Date().toISOString().split('T')[0],
        meal_type: mealType,
        meal_name: foods.map(f => f.name).join(', '),
        calories,
        protein_g: macros.protein,
        carbs_g: macros.carbs,
        fat_g: macros.fat,
        foods
      })
      .select()
      .single();

    if (error) throw error;

    await this.trackEvent('meal_logged', { userId, mealType, calories });

    return data;
  },

  // Coaching Sessions
  async bookCoachingSession(userId, sessionDate, sessionType) {
    const prices = {
      onboarding: 297,
      weekly: 497,
      monthly: 1997,
      emergency: 997
    };

    const { data, error } = await window.supabaseClient
      .from('coaching_sessions')
      .insert({
        user_id: userId,
        session_date: sessionDate,
        session_type: sessionType,
        price_paid: prices[sessionType],
        status: 'scheduled'
      })
      .select()
      .single();

    if (error) throw error;

    await this.trackEvent('coaching_booked', { userId, sessionType, price: prices[sessionType] });

    return data;
  },

  // Donations
  async recordDonation(email, amount, message, isAnonymous = false) {
    const { data, error } = await window.supabaseClient
      .from('donations')
      .insert({
        email: isAnonymous ? null : email,
        amount,
        donation_type: 'one_time',
        buymeacoffee_username: 'istanifitn',
        message,
        is_anonymous: isAnonymous
      })
      .select()
      .single();

    if (error) throw error;

    await this.trackEvent('donation', { amount, isAnonymous });

    return data;
  },

  // Get User Progress
  async getUserProgress(userId) {
    const [user, workouts, meals, measurements] = await Promise.all([
      window.supabaseClient.from('users').select('*').eq('id', userId).single(),
      window.supabaseClient.from('workout_sessions').select('*').eq('user_id', userId).order('workout_date', { ascending: false }).limit(30),
      window.supabaseClient.from('meals').select('*').eq('user_id', userId).order('meal_date', { ascending: false }).limit(30),
      window.supabaseClient.from('body_measurements').select('*').eq('user_id', userId).order('measurement_date', { ascending: false }).limit(10)
    ]);

    return {
      user: user.data,
      workouts: workouts.data,
      meals: meals.data,
      measurements: measurements.data
    };
  },

  // AI Recommendations
  async getAIRecommendations(userId) {
    const { data, error } = await window.supabaseClient
      .from('ai_recommendations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Analytics
  async trackEvent(eventType, eventData = {}) {
    try {
      await window.supabaseClient
        .from('analytics_events')
        .insert({
          event_type: eventType,
          event_data: eventData,
          session_id: sessionStorage.getItem('session_id') || null,
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  },

  // Get Blog Posts
  async getBlogPosts(limit = 10, category = null) {
    let query = window.supabaseClient
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get Workout Programs
  async getWorkoutPrograms(difficulty = null, isPremium = null) {
    let query = window.supabaseClient
      .from('workout_programs')
      .select('*')
      .order('created_at', { ascending: false });

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    if (isPremium !== null) {
      query = query.eq('is_premium', isPremium);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
};

// Auto-initialize on page load
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initSupabaseClient();

    // Generate session ID for analytics
    if (!sessionStorage.getItem('session_id')) {
      sessionStorage.setItem('session_id', 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));
    }
  });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SUPABASE_CONFIG, SupabaseAPI };
}

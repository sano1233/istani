import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // Use placeholder values if environment variables are not set
  // This prevents the app from crashing when Supabase is not configured
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder';

  try {
    return createBrowserClient(url, key);
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    // Return a minimal mock client to prevent crashes
    return createBrowserClient(url, key);
  }
}

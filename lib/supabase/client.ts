import { createBrowserClient } from '@supabase/ssr';

let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During build/prerender, env vars might not be available
  // Create a placeholder client that allows build to complete
  // At runtime, if env vars are available, recreate the client
  if (!url || !key) {
    // Use placeholder values during build - this allows build to complete
    // The client will be recreated at runtime when env vars are available
    if (!clientInstance) {
      const placeholderUrl = 'https://placeholder.supabase.co';
      const placeholderKey =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder';
      clientInstance = createBrowserClient(placeholderUrl, placeholderKey);
    }
    return clientInstance;
  }

  // If we have real env vars and no instance, or instance was created with placeholders, create new one
  if (!clientInstance || (typeof window !== 'undefined' && url && key)) {
    clientInstance = createBrowserClient(url, key);
  }

  return clientInstance;
}

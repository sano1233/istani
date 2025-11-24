import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    // Return next response without auth if env vars are missing
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Supabase session refresh is disabled in middleware to avoid Edge runtime incompatibilities.
  // Session handling should be performed within server actions or API routes.
  return response;
}

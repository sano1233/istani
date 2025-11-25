import { Sidebar } from '@/components/ui/sidebar';
import { SUPABASE_FALLBACK_FLAG } from '@/lib/supabase/fallback';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) { 
  const supabase = await createClient();

  const fallbackMarker = supabase as unknown as Record<symbol, boolean>;
  const isFallbackClient = Boolean(fallbackMarker[SUPABASE_FALLBACK_FLAG]);

  const {
    data: { user },
  } = isFallbackClient ? { data: { user: null } } : await supabase.auth.getUser();

  if (!user && !isFallbackClient) {
    redirect('/login');
  }

  const userId = user?.id;

  const { data: profile } = isFallbackClient || !userId
    ? { data: null }
    : await supabase.from('profiles').select('full_name, avatar_url').eq('id', userId).single();

  return (
    <div className="flex w-full min-h-screen">
      <Sidebar userName={profile?.full_name || 'User'} userAvatar={profile?.avatar_url} />
      {children}
    </div>
  );
}

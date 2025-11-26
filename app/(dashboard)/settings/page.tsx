import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

/**
 * Render the account settings page for the current authenticated user.
 *
 * Retrieves the authenticated user and their profile; if no user is found, redirects to '/login'.
 *
 * @returns The JSX for the settings page populated with the user's profile fields.
 */
export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  return (
    <main className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black text-white">Settings</h1>
          <Button>Save Changes</Button>
        </div>

        {/* Profile Header */}
        <div className="mb-10 p-4">
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-5xl">person</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{profile?.full_name || 'User'}</h2>
              <p className="text-white/60">
                Member since{' '}
                {profile?.member_since &&
                  new Date(profile.member_since).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Profile</h2>
          <p className="text-white/60 mb-6">Manage your personal and physical information.</p>

          <h3 className="text-xl font-bold text-white pt-5 pb-3">Personal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              placeholder="Jane Doe"
              defaultValue={profile?.full_name || ''}
            />
            <Input
              label="Email"
              type="email"
              placeholder="jane@istani.com"
              defaultValue={profile?.email || ''}
            />
            <Input label="Age" type="number" placeholder="28" defaultValue={profile?.age || ''} />
            <div className="flex flex-col">
              <label className="pb-2 text-base font-medium text-white">Sex</label>
              <select className="w-full h-12 p-3 text-base font-normal leading-normal text-white bg-white/5 rounded-lg border border-white/10 focus:ring-1 focus:ring-primary focus:border-primary">
                <option className="bg-background-dark" value="female">
                  Female
                </option>
                <option className="bg-background-dark" value="male">
                  Male
                </option>
                <option className="bg-background-dark" value="">
                  Prefer not to say
                </option>
              </select>
            </div>
          </div>

          <h3 className="mt-8 text-xl font-bold text-white pt-5 pb-3">Physical Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Height (cm)"
              type="number"
              placeholder="170"
              defaultValue={profile?.height_cm || ''}
            />
            <Input
              label="Weight (kg)"
              type="number"
              placeholder="65"
              defaultValue={profile?.weight_kg || ''}
            />
            <Input
              label="Body Fat %"
              type="number"
              placeholder="22"
              defaultValue={profile?.body_fat_percentage || ''}
            />
          </div>
        </Card>

        {/* Fitness Goals Section */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Fitness Goals</h2>
          <p className="text-white/60 mb-6">Define what you want to achieve.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="pb-2 text-base font-medium text-white">Primary Goal</label>
              <select className="w-full h-12 p-3 text-base font-normal leading-normal text-white bg-white/5 rounded-lg border border-white/10 focus:ring-1 focus:ring-primary focus:border-primary">
                <option className="bg-background-dark">Fat Loss</option>
                <option className="bg-background-dark">Muscle Gain</option>
                <option className="bg-background-dark">Maintenance</option>
                <option className="bg-background-dark">Improve Endurance</option>
              </select>
            </div>
            <Input label="Target Date" type="date" />
          </div>
        </Card>
      </div>
    </main>
  );
}

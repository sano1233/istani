import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileSettings } from '@/components/profile-settings'
import { BodyMeasurements } from '@/components/body-measurements'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get recent body measurements
  const { data: measurements } = await supabase
    .from('body_measurements')
    .select('*')
    .eq('user_id', user.id)
    .order('measured_at', { ascending: false })
    .limit(10)

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your profile, goals, and preferences
          </p>
        </div>

        {/* Account Info Card */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Account Information</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Email</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t">
              <span className="text-sm text-gray-600">Account Created</span>
              <span className="font-medium">
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-t">
              <span className="text-sm text-gray-600">Last Sign In</span>
              <span className="font-medium">
                {user.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleDateString()
                  : 'Never'}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Settings */}
        <ProfileSettings profile={profile} userId={user.id} />

        {/* Body Measurements */}
        <BodyMeasurements
          userId={user.id}
          profile={profile}
          measurements={measurements || []}
        />

        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h2>
          <p className="text-sm text-red-700 mb-4">
            These actions are permanent and cannot be undone
          </p>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            onClick={() => {
              if (
                confirm(
                  'Are you sure you want to delete your account? This action cannot be undone.'
                )
              ) {
                alert('Account deletion requires contacting support: istaniDOTstore@proton.me')
              }
            }}
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}

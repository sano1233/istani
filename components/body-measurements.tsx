'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Measurement {
  id: string
  weight_kg: number
  body_fat_percentage: number | null
  chest_cm: number | null
  waist_cm: number | null
  hips_cm: number | null
  measured_at: string
}

interface Profile {
  current_weight_kg: number | null
  target_weight_kg: number | null
}

export function BodyMeasurements({
  userId,
  profile,
  measurements,
}: {
  userId: string
  profile: Profile | null
  measurements: Measurement[]
}) {
  const [showForm, setShowForm] = useState(false)
  const [weight, setWeight] = useState('')
  const [targetWeight, setTargetWeight] = useState(profile?.target_weight_kg?.toString() || '')
  const [bodyFat, setBodyFat] = useState('')
  const [chest, setChest] = useState('')
  const [waist, setWaist] = useState('')
  const [hips, setHips] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      // Insert new measurement
      const { error: measurementError } = await supabase
        .from('body_measurements')
        .insert({
          user_id: userId,
          weight_kg: Number(weight),
          body_fat_percentage: bodyFat ? Number(bodyFat) : null,
          chest_cm: chest ? Number(chest) : null,
          waist_cm: waist ? Number(waist) : null,
          hips_cm: hips ? Number(hips) : null,
          measured_at: new Date().toISOString(),
        })

      if (measurementError) throw measurementError

      // Update profile with current weight and target
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          current_weight_kg: Number(weight),
          target_weight_kg: targetWeight ? Number(targetWeight) : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (profileError) throw profileError

      setSuccess(true)
      setShowForm(false)

      // Reset form
      setWeight('')
      setBodyFat('')
      setChest('')
      setWaist('')
      setHips('')

      // Reload page to show updated measurements
      setTimeout(() => window.location.reload(), 1500)
    } catch (error: any) {
      console.error('Error saving measurements:', error)
      alert('Failed to save measurements: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Body Measurements</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {showForm ? 'Cancel' : '+ Add Measurement'}
        </button>
      </div>

      {/* Current Stats */}
      {profile && (
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="text-xs text-gray-600">Current Weight</div>
            <div className="text-2xl font-bold">
              {profile.current_weight_kg ? `${profile.current_weight_kg} kg` : '--'}
            </div>
            {profile.current_weight_kg && (
              <div className="text-xs text-gray-500">
                {(profile.current_weight_kg * 2.20462).toFixed(1)} lbs
              </div>
            )}
          </div>
          <div>
            <div className="text-xs text-gray-600">Target Weight</div>
            <div className="text-2xl font-bold">
              {profile.target_weight_kg ? `${profile.target_weight_kg} kg` : '--'}
            </div>
            {profile.target_weight_kg && profile.current_weight_kg && (
              <div className="text-xs text-gray-500">
                {profile.current_weight_kg > profile.target_weight_kg ? '↓' : '↑'}{' '}
                {Math.abs(profile.current_weight_kg - profile.target_weight_kg).toFixed(1)} kg to go
              </div>
            )}
          </div>
        </div>
      )}

      {/* Measurement Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Weight (kg) *</label>
              <input
                type="number"
                required
                step="0.1"
                min="20"
                max="300"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="75.0"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Target Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min="20"
                max="300"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                placeholder="70.0"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Body Fat %</label>
              <input
                type="number"
                step="0.1"
                min="3"
                max="60"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                placeholder="15.0"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Chest (cm)</label>
              <input
                type="number"
                step="0.1"
                min="50"
                max="200"
                value={chest}
                onChange={(e) => setChest(e.target.value)}
                placeholder="100.0"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Waist (cm)</label>
              <input
                type="number"
                step="0.1"
                min="40"
                max="200"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                placeholder="85.0"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Hips (cm)</label>
              <input
                type="number"
                step="0.1"
                min="50"
                max="200"
                value={hips}
                onChange={(e) => setHips(e.target.value)}
                placeholder="95.0"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Saving...' : success ? '✅ Saved!' : 'Save Measurement'}
          </button>
        </form>
      )}

      {/* Measurement History */}
      {measurements.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 mb-3">History</h3>
          {measurements.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
            >
              <div>
                <div className="font-medium">{m.weight_kg} kg</div>
                <div className="text-xs text-gray-600">
                  {new Date(m.measured_at).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right text-sm text-gray-600">
                {m.body_fat_percentage && <div>BF: {m.body_fat_percentage}%</div>}
                {m.waist_cm && <div className="text-xs">Waist: {m.waist_cm}cm</div>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-sm">No measurements yet</p>
          <p className="text-xs mt-1">Track your progress by adding your first measurement</p>
        </div>
      )}
    </div>
  )
}

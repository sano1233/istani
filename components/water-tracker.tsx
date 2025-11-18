'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { createClient } from '@/lib/supabase/client'

interface WaterTrackerProps {
  userId: string
  currentGlasses: number
  dailyGoal: number
  recommendedGlasses: number
  loggedTimes: string[]
}

export function WaterTracker({
  userId,
  currentGlasses: initialGlasses,
  dailyGoal: initialGoal,
  recommendedGlasses,
  loggedTimes: initialTimes,
}: WaterTrackerProps) {
  const [glasses, setGlasses] = useState(initialGlasses)
  const [goal, setGoal] = useState(initialGoal)
  const [loggedTimes, setLoggedTimes] = useState<Date[]>(
    initialTimes.map(t => new Date(t))
  )
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const percentage = (glasses / goal) * 100
  const today = new Date().toISOString().split('T')[0]

  async function addGlass() {
    if (loading) return
    setLoading(true)

    try {
      const now = new Date()
      const newGlasses = glasses + 1
      const newTimes = [...loggedTimes, now]

      // Update UI immediately
      setGlasses(newGlasses)
      setLoggedTimes(newTimes)

      // Update database
      const { error } = await supabase
        .from('water_intake')
        .upsert({
          user_id: userId,
          date: today,
          glasses_consumed: newGlasses,
          daily_goal: goal,
          logged_times: newTimes.map(t => t.toISOString()),
        })

      if (error) throw error

      // Update streak if goal reached
      if (newGlasses >= goal) {
        await supabase.rpc('update_user_streak', {
          p_user_id: userId,
          p_streak_type: 'water',
          p_activity_date: today,
        })

        // Send celebration message
        await supabase.from('coaching_messages').insert({
          user_id: userId,
          message_type: 'celebration',
          title: '💧 Hydration Goal Achieved!',
          content: `Congratulations! You've hit your water goal of ${goal} glasses today. Keep it up!`,
          priority: 'normal',
        })
      }
    } catch (error) {
      console.error('Error logging water:', error)
      // Revert on error
      setGlasses(glasses)
      setLoggedTimes(loggedTimes)
    } finally {
      setLoading(false)
    }
  }

  async function removeGlass() {
    if (glasses === 0 || loading) return
    setLoading(true)

    try {
      const newGlasses = glasses - 1
      const newTimes = loggedTimes.slice(0, -1)

      setGlasses(newGlasses)
      setLoggedTimes(newTimes)

      await supabase
        .from('water_intake')
        .upsert({
          user_id: userId,
          date: today,
          glasses_consumed: newGlasses,
          daily_goal: goal,
          logged_times: newTimes.map(t => t.toISOString()),
        })
    } catch (error) {
      console.error('Error removing water:', error)
      setGlasses(glasses)
      setLoggedTimes(loggedTimes)
    } finally {
      setLoading(false)
    }
  }

  async function updateGoal(newGoal: number) {
    if (loading) return
    setLoading(true)

    try {
      setGoal(newGoal)

      await supabase
        .from('water_intake')
        .upsert({
          user_id: userId,
          date: today,
          glasses_consumed: glasses,
          daily_goal: newGoal,
          logged_times: loggedTimes.map(t => t.toISOString()),
        })
    } catch (error) {
      console.error('Error updating goal:', error)
      setGoal(goal)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Today&apos;s Water Intake</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/60">Daily Goal:</span>
            <select
              value={goal}
              onChange={(e) => updateGoal(Number(e.target.value))}
              className="h-8 px-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:ring-1 focus:ring-primary"
              disabled={loading}
            >
              {[6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((num) => (
                <option key={num} value={num} className="bg-background-dark">
                  {num} glasses
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Visual Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              {/* Water Cup SVG */}
              <svg width="200" height="200" viewBox="0 0 200 200">
                {/* Cup outline */}
                <path
                  d="M 50 40 L 40 180 L 160 180 L 150 40 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-white/20"
                />
                {/* Water fill */}
                <defs>
                  <clipPath id="cup-clip">
                    <path d="M 50 40 L 40 180 L 160 180 L 150 40 Z" />
                  </clipPath>
                </defs>
                <rect
                  x="40"
                  y={180 - (140 * Math.min(percentage, 100)) / 100}
                  width="120"
                  height={(140 * Math.min(percentage, 100)) / 100}
                  fill="currentColor"
                  className="text-primary transition-all duration-500"
                  clipPath="url(#cup-clip)"
                />
              </svg>
              {/* Percentage text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-black text-white">
                  {Math.round(percentage)}%
                </span>
              </div>
            </div>
          </div>

          {/* Glass count */}
          <div className="text-center mb-6">
            <p className="text-6xl font-black text-white mb-2">
              {glasses}<span className="text-white/40">/{goal}</span>
            </p>
            <p className="text-white/60">
              {glasses >= goal
                ? '🎉 Goal achieved! Keep hydrating!'
                : `${goal - glasses} more glass${goal - glasses !== 1 ? 'es' : ''} to go`}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>

          {/* Controls */}
          <div className="flex gap-4 justify-center">
            <Button
              onClick={removeGlass}
              disabled={glasses === 0 || loading}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <span className="material-symbols-outlined">remove</span>
              Remove
            </Button>
            <Button
              onClick={addGlass}
              disabled={loading}
              size="lg"
              className="gap-2"
            >
              <span className="material-symbols-outlined">add</span>
              Add Glass
            </Button>
          </div>
        </div>

        {/* Recent logs */}
        {loggedTimes.length > 0 && (
          <div className="border-t border-white/10 pt-6">
            <h4 className="text-sm font-semibold text-white mb-3">
              Today&apos;s Log ({loggedTimes.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {loggedTimes.slice(-8).reverse().map((time, index) => (
                <div
                  key={index}
                  className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80"
                >
                  {time.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendation */}
        {recommendedGlasses !== goal && (
          <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary">info</span>
              <div>
                <p className="text-sm font-semibold text-white mb-1">
                  Personalized Recommendation
                </p>
                <p className="text-sm text-white/80">
                  Based on your weight and activity level, we recommend{' '}
                  <strong>{recommendedGlasses} glasses</strong> per day.
                </p>
                {recommendedGlasses !== goal && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => updateGoal(recommendedGlasses)}
                  >
                    Update to {recommendedGlasses} glasses
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

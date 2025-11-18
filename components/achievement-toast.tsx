'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked_at: string
}

export function AchievementToast({ userId }: { userId: string }) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [dismissed, setDismissed] = useState<string[]>([])

  const supabase = createClient()

  useEffect(() => {
    // Check for recent achievements (last 24 hours)
    const checkRecentAchievements = async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const { data } = await supabase
        .from('user_achievements')
        .select(`
          id,
          unlocked_at,
          achievements (
            name,
            description,
            icon
          )
        `)
        .eq('user_id', userId)
        .gte('unlocked_at', yesterday.toISOString())
        .order('unlocked_at', { ascending: false })

      if (data && data.length > 0) {
        const formattedAchievements = data.map((item: any) => ({
          id: item.id,
          name: item.achievements.name,
          description: item.achievements.description,
          icon: item.achievements.icon,
          unlocked_at: item.unlocked_at,
        }))
        setAchievements(formattedAchievements)
      }
    }

    checkRecentAchievements()

    // Subscribe to new achievements
    const subscription = supabase
      .channel('user_achievements_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_achievements',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          // Fetch the achievement details
          const { data } = await supabase
            .from('achievements')
            .select('*')
            .eq('id', payload.new.achievement_id)
            .single()

          if (data) {
            setAchievements((prev) => [
              {
                id: payload.new.id,
                name: data.name,
                description: data.description,
                icon: data.icon,
                unlocked_at: payload.new.unlocked_at,
              },
              ...prev,
            ])
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId, supabase])

  const visibleAchievements = achievements.filter((a) => !dismissed.includes(a.id))

  if (visibleAchievements.length === 0) {
    return null
  }

  return (
    <div className="fixed top-20 right-6 z-50 space-y-3 max-w-sm">
      {visibleAchievements.map((achievement) => (
        <div
          key={achievement.id}
          className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white p-4 rounded-lg shadow-2xl animate-slide-in-right"
        >
          <div className="flex items-start gap-3">
            <div className="text-4xl flex-shrink-0">{achievement.icon}</div>
            <div className="flex-1">
              <div className="text-xs font-semibold uppercase tracking-wide mb-1">
                Achievement Unlocked!
              </div>
              <h3 className="font-bold text-lg mb-1">{achievement.name}</h3>
              <p className="text-sm opacity-90">{achievement.description}</p>
            </div>
            <button
              onClick={() => setDismissed([...dismissed, achievement.id])}
              className="text-white opacity-70 hover:opacity-100 text-xl"
            >
              ×
            </button>
          </div>

          {/* Auto-dismiss after 10 seconds */}
          <div className="mt-2 w-full bg-white/20 rounded-full h-1 overflow-hidden">
            <div
              className="h-full bg-white animate-shrink-width"
              style={{ animationDuration: '10s' }}
            />
          </div>
        </div>
      ))}

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes shrink-width {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out;
        }

        .animate-shrink-width {
          animation: shrink-width 10s linear forwards;
        }
      `}</style>
    </div>
  )
}

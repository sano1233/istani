'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Dumbbell } from 'lucide-react'
import type { WorkoutGenerationRequest, WorkoutPlan } from '@/types'

const workoutSchema = z.object({
  goal: z.enum(['weight_loss', 'muscle_gain', 'endurance', 'general_fitness']),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  daysPerWeek: z.number().min(1).max(7),
  equipment: z.array(z.string()).optional(),
  focusAreas: z.array(z.string()).optional(),
})

type WorkoutFormData = z.infer<typeof workoutSchema>

export function AIWorkoutGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      daysPerWeek: 3,
      goal: 'general_fitness',
      level: 'beginner',
    },
  })

  const daysPerWeek = watch('daysPerWeek')

  const onSubmit = async (data: WorkoutFormData) => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/workouts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to generate workout plan')
      }

      const plan = await response.json()
      setWorkoutPlan(plan)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Dumbbell className="h-8 w-8 text-red-500" />
          AI Workout Plan Generator
        </h2>
        <p className="text-gray-600">
          Get a personalized workout plan tailored to your goals and fitness level
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        <div>
          <label className="block text-sm font-medium mb-2">Fitness Goal</label>
          <select
            {...register('goal')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="weight_loss">Weight Loss</option>
            <option value="muscle_gain">Muscle Gain</option>
            <option value="endurance">Endurance</option>
            <option value="general_fitness">General Fitness</option>
          </select>
          {errors.goal && (
            <p className="text-red-500 text-sm mt-1">{errors.goal.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Experience Level</label>
          <select
            {...register('level')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          {errors.level && (
            <p className="text-red-500 text-sm mt-1">{errors.level.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Days Per Week: <span className="font-bold text-red-500">{daysPerWeek}</span>
          </label>
          <input
            type="range"
            min="1"
            max="7"
            {...register('daysPerWeek', { valueAsNumber: true })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          {errors.daysPerWeek && (
            <p className="text-red-500 text-sm mt-1">{errors.daysPerWeek.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating Your Personalized Plan...
            </>
          ) : (
            'Generate AI Workout Plan'
          )}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {workoutPlan && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-bold mb-4">{workoutPlan.title}</h3>
          <p className="text-gray-600 mb-6">{workoutPlan.description}</p>

          {workoutPlan.weeks && workoutPlan.weeks.map((week) => (
            <div key={week.weekNumber} className="mb-6">
              <h4 className="text-xl font-semibold mb-3 text-red-600">
                Week {week.weekNumber}
              </h4>
              {week.days.map((day, dayIndex) => (
                <div key={dayIndex} className="mb-4 border-l-4 border-red-500 pl-4">
                  <h5 className="font-semibold text-lg">
                    {day.day} - {day.focus}
                  </h5>
                  <div className="mt-2 space-y-2">
                    {day.exercises.map((exercise, exIndex) => (
                      <div key={exIndex} className="bg-gray-50 p-3 rounded">
                        <p className="font-medium">{exercise.name}</p>
                        <p className="text-sm text-gray-600">
                          {exercise.sets} sets × {exercise.reps} reps • Rest: {exercise.rest}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {exercise.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

'use client';

import { useState } from 'react';
import { exerciseLibrary, searchExercises, type Exercise } from '@/lib/exercise-library';

export default function ExercisesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Exercise['category'] | 'all'>('all');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const filteredExercises = searchQuery
    ? searchExercises(searchQuery, 50)
    : selectedCategory === 'all'
    ? exerciseLibrary
    : exerciseLibrary.filter(ex => ex.category === selectedCategory);

  const categories = [
    { value: 'all', label: '💪 All', gradient: 'from-purple-600 to-pink-600' },
    { value: 'chest', label: '🏋️ Chest', gradient: 'from-blue-600 to-cyan-600' },
    { value: 'back', label: '🤸 Back', gradient: 'from-green-600 to-emerald-600' },
    { value: 'legs', label: '🦵 Legs', gradient: 'from-orange-600 to-red-600' },
    { value: 'shoulders', label: '💪 Shoulders', gradient: 'from-yellow-600 to-orange-600' },
    { value: 'arms', label: '💪 Arms', gradient: 'from-pink-600 to-purple-600' },
    { value: 'core', label: '🧘 Core', gradient: 'from-indigo-600 to-purple-600' },
    { value: 'cardio', label: '🏃 Cardio', gradient: 'from-red-600 to-pink-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 transition-colors hover:text-purple-400">
              <div className="text-2xl">💪</div>
              <span className="text-xl font-semibold tracking-tight">Istani Fitness</span>
            </a>
            <div className="flex items-center gap-3">
              <a href="/learn" className="text-sm text-gray-400 hover:text-white">📚 Learn</a>
              <a href="/dashboard" className="text-sm text-gray-400 hover:text-white">Dashboard</a>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-24">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
            Exercise Library
          </h1>
          <p className="text-xl text-gray-300">
            Comprehensive exercise database with form tips and muscle targeting
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search exercises, muscles, equipment..."
            className="w-full rounded-full border border-white/20 bg-white/5 px-6 py-4 text-lg text-white placeholder-gray-500 backdrop-blur-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>

        {/* Category Filter */}
        <div className="mb-12 flex flex-wrap gap-3">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value as any)}
              className={`rounded-full px-6 py-3 font-semibold transition-all hover:scale-105 ${
                selectedCategory === cat.value
                  ? `bg-gradient-to-r ${cat.gradient} shadow-lg`
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Exercise Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredExercises.map(exercise => (
            <button
              key={exercise.id}
              onClick={() => setSelectedExercise(exercise)}
              className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 text-left transition-all hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 hover:scale-105"
            >
              <div className="mb-4 text-5xl">{exercise.icon}</div>
              <h3 className="mb-2 text-xl font-semibold text-purple-400 group-hover:text-purple-300">
                {exercise.name}
              </h3>
              <div className="mb-3 flex items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  exercise.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                  exercise.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {exercise.difficulty}
                </span>
                <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-400">
                  {exercise.category}
                </span>
              </div>
              <p className="mb-3 text-sm text-gray-400 line-clamp-2">
                {exercise.description}
              </p>
              <div className="text-xs text-gray-500">
                {exercise.sets} sets × {exercise.reps} reps
              </div>
            </button>
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
            <div className="mb-4 text-6xl">🔍</div>
            <p className="text-xl text-gray-400">No exercises found</p>
            <p className="mt-2 text-sm text-gray-500">Try a different search or category</p>
          </div>
        )}
      </div>

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
          onClick={() => setSelectedExercise(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/20 bg-gradient-to-br from-gray-900 to-black p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="mb-4 text-6xl">{selectedExercise.icon}</div>
                <h2 className="text-3xl font-bold text-purple-400">{selectedExercise.name}</h2>
                <div className="mt-3 flex gap-2">
                  <span className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    selectedExercise.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                    selectedExercise.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {selectedExercise.difficulty}
                  </span>
                  <span className="rounded-full bg-blue-500/20 px-3 py-1 text-sm font-semibold text-blue-400">
                    {selectedExercise.category}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedExercise(null)}
                className="rounded-full bg-white/10 p-3 hover:bg-white/20"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <section>
                <h3 className="mb-3 text-xl font-semibold text-purple-300">Description</h3>
                <p className="text-gray-300 leading-relaxed">{selectedExercise.description}</p>
              </section>

              <section>
                <h3 className="mb-3 text-xl font-semibold text-purple-300">Sets & Reps</h3>
                <p className="text-2xl font-bold text-purple-400">
                  {selectedExercise.sets} sets × {selectedExercise.reps} reps
                </p>
              </section>

              <section>
                <h3 className="mb-3 text-xl font-semibold text-purple-300">Primary Muscles</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedExercise.primaryMuscles.map(muscle => (
                    <span key={muscle} className="rounded-full bg-purple-500/20 px-4 py-2 text-sm font-semibold text-purple-400">
                      {muscle}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-xl font-semibold text-purple-300">Secondary Muscles</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedExercise.secondaryMuscles.map(muscle => (
                    <span key={muscle} className="rounded-full bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-400">
                      {muscle}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-xl font-semibold text-purple-300">Equipment Needed</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedExercise.equipment.map(eq => (
                    <span key={eq} className="rounded-full bg-green-500/20 px-4 py-2 text-sm font-semibold text-green-400">
                      {eq}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-xl font-semibold text-green-300">✅ Form Tips</h3>
                <ul className="space-y-2">
                  {selectedExercise.formTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-300">
                      <span className="text-green-400">✓</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="mb-3 text-xl font-semibold text-red-300">⚠️ Common Mistakes</h3>
                <ul className="space-y-2">
                  {selectedExercise.commonMistakes.map((mistake, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-300">
                      <span className="text-red-400">✗</span>
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

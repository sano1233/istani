'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Exercise {
  id: string;
  name: string;
  muscle_groups: string[];
  equipment: string[];
  difficulty: string;
  instructions: string[];
}

interface ProgramExercise {
  exercise_id: string;
  exercise_name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes: string;
  order_index: number;
}

interface WorkoutDay {
  day: number;
  name: string;
  focus: string;
  exercises: ProgramExercise[];
}

interface Week {
  week: number;
  focus: string;
  days: WorkoutDay[];
}

interface Program {
  name: string;
  description: string;
  duration_weeks: number;
  days_per_week: number;
  difficulty: string;
  program_type: string;
  equipment_required: string[];
  target_audience: string[];
  weekly_structure: Week[];
}

export function ProgramBuilder() {
  const [program, setProgram] = useState<Program>({
    name: '',
    description: '',
    duration_weeks: 4,
    days_per_week: 3,
    difficulty: 'intermediate',
    program_type: 'strength',
    equipment_required: [],
    target_audience: [],
    weekly_structure: [],
  });

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDay, setCurrentDay] = useState(1);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMuscle, setFilterMuscle] = useState('all');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadExercises();
    initializeProgram();
  }, []);

  async function loadExercises() {
    try {
      // Load from exercises table (assuming it exists from previous migrations)
      const { data } = await supabase
        .from('exercises')
        .select('*')
        .order('name');

      if (data) {
        setExercises(data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading exercises:', error);
      setLoading(false);
    }
  }

  function initializeProgram() {
    const weeks: Week[] = [];

    for (let w = 1; w <= 4; w++) {
      const days: WorkoutDay[] = [];

      for (let d = 1; d <= 3; d++) {
        days.push({
          day: d,
          name: `Day ${d}`,
          focus: d === 1 ? 'Upper Body' : d === 2 ? 'Lower Body' : 'Full Body',
          exercises: [],
        });
      }

      weeks.push({
        week: w,
        focus: w === 1 ? 'Foundation' : w === 2 ? 'Build' : w === 3 ? 'Intensify' : 'Peak',
        days,
      });
    }

    setProgram({ ...program, weekly_structure: weeks });
  }

  function addExerciseToDay(exerciseId: string, exerciseName: string) {
    const updatedWeeks = [...program.weekly_structure];
    const week = updatedWeeks.find((w) => w.week === currentWeek);

    if (week) {
      const day = week.days.find((d) => d.day === currentDay);

      if (day) {
        const newExercise: ProgramExercise = {
          exercise_id: exerciseId,
          exercise_name: exerciseName,
          sets: 3,
          reps: '8-12',
          rest_seconds: 90,
          notes: '',
          order_index: day.exercises.length,
        };

        day.exercises.push(newExercise);
        setProgram({ ...program, weekly_structure: updatedWeeks });
        setShowExerciseModal(false);
      }
    }
  }

  function updateExercise(
    weekNum: number,
    dayNum: number,
    exerciseIndex: number,
    field: keyof ProgramExercise,
    value: any
  ) {
    const updatedWeeks = [...program.weekly_structure];
    const week = updatedWeeks.find((w) => w.week === weekNum);

    if (week) {
      const day = week.days.find((d) => d.day === dayNum);

      if (day && day.exercises[exerciseIndex]) {
        day.exercises[exerciseIndex] = {
          ...day.exercises[exerciseIndex],
          [field]: value,
        };
        setProgram({ ...program, weekly_structure: updatedWeeks });
      }
    }
  }

  function removeExercise(weekNum: number, dayNum: number, exerciseIndex: number) {
    const updatedWeeks = [...program.weekly_structure];
    const week = updatedWeeks.find((w) => w.week === weekNum);

    if (week) {
      const day = week.days.find((d) => d.day === dayNum);

      if (day) {
        day.exercises.splice(exerciseIndex, 1);
        // Update order indices
        day.exercises.forEach((ex, idx) => {
          ex.order_index = idx;
        });
        setProgram({ ...program, weekly_structure: updatedWeeks });
      }
    }
  }

  async function saveProgram() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('training_programs')
        .insert({
          trainer_id: user.id,
          name: program.name,
          description: program.description,
          program_type: program.program_type,
          difficulty: program.difficulty,
          duration_weeks: program.duration_weeks,
          days_per_week: program.days_per_week,
          equipment_required: program.equipment_required,
          target_audience: program.target_audience,
          weekly_structure: program.weekly_structure,
          is_template: true,
          is_public: false,
        })
        .select()
        .single();

      if (data) {
        alert('Program saved successfully!');
      } else if (error) {
        console.error('Error saving program:', error);
        alert('Error saving program');
      }
    } catch (error) {
      console.error('Error saving program:', error);
    }
  }

  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle =
      filterMuscle === 'all' || ex.muscle_groups.includes(filterMuscle);
    return matchesSearch && matchesMuscle;
  });

  const muscleGroups = ['all', 'chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio'];

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Workout Program Builder</h1>
        <p className="text-white/60">Create custom training programs for clients or yourself</p>
      </div>

      {/* Program Info */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-white mb-4">Program Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/80 text-sm font-semibold mb-2">Program Name</label>
            <input
              type="text"
              value={program.name}
              onChange={(e) => setProgram({ ...program, name: e.target.value })}
              placeholder="e.g., 12-Week Strength Builder"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-semibold mb-2">Program Type</label>
            <select
              value={program.program_type}
              onChange={(e) => setProgram({ ...program, program_type: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            >
              <option value="strength">Strength</option>
              <option value="hypertrophy">Hypertrophy (Muscle Building)</option>
              <option value="fat_loss">Fat Loss</option>
              <option value="athletic">Athletic Performance</option>
              <option value="general_fitness">General Fitness</option>
            </select>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-semibold mb-2">Duration (weeks)</label>
            <input
              type="number"
              min="1"
              max="52"
              value={program.duration_weeks}
              onChange={(e) =>
                setProgram({ ...program, duration_weeks: parseInt(e.target.value) || 4 })
              }
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-semibold mb-2">Days per Week</label>
            <input
              type="number"
              min="1"
              max="7"
              value={program.days_per_week}
              onChange={(e) =>
                setProgram({ ...program, days_per_week: parseInt(e.target.value) || 3 })
              }
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-semibold mb-2">Difficulty</label>
            <select
              value={program.difficulty}
              onChange={(e) => setProgram({ ...program, difficulty: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-white/80 text-sm font-semibold mb-2">Description</label>
            <textarea
              value={program.description}
              onChange={(e) => setProgram({ ...program, description: e.target.value })}
              placeholder="Describe the program goals and structure..."
              rows={3}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            />
          </div>
        </div>
      </Card>

      {/* Week/Day Navigator */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-white/60">Week</span>
            <select
              value={currentWeek}
              onChange={(e) => setCurrentWeek(parseInt(e.target.value))}
              className="px-3 py-1 bg-white/5 border border-white/10 rounded text-white"
            >
              {program.weekly_structure.map((week) => (
                <option key={week.week} value={week.week}>
                  {week.week} - {week.focus}
                </option>
              ))}
            </select>
          </div>

          <Button onClick={saveProgram} size="sm">
            <span className="material-symbols-outlined mr-2">save</span>
            Save Program
          </Button>
        </div>

        <div className="flex gap-2">
          {program.weekly_structure
            .find((w) => w.week === currentWeek)
            ?.days.map((day) => (
              <button
                key={day.day}
                onClick={() => setCurrentDay(day.day)}
                className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                  currentDay === day.day
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                <p className="font-semibold">{day.name}</p>
                <p className="text-xs">{day.focus}</p>
              </button>
            ))}
        </div>
      </Card>

      {/* Current Day Exercises */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">
            Week {currentWeek} - Day {currentDay} Exercises
          </h3>
          <Button
            onClick={() => setShowExerciseModal(true)}
            variant="outline"
            size="sm"
          >
            <span className="material-symbols-outlined mr-2">add</span>
            Add Exercise
          </Button>
        </div>

        {program.weekly_structure
          .find((w) => w.week === currentWeek)
          ?.days.find((d) => d.day === currentDay)?.exercises.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-white/20 mb-4">
              fitness_center
            </span>
            <p className="text-white/60 mb-4">No exercises added yet</p>
            <Button onClick={() => setShowExerciseModal(true)}>
              <span className="material-symbols-outlined mr-2">add</span>
              Add First Exercise
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {program.weekly_structure
              .find((w) => w.week === currentWeek)
              ?.days.find((d) => d.day === currentDay)
              ?.exercises.map((exercise, index) => (
                <div
                  key={index}
                  className="p-4 bg-white/5 border border-white/10 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-white/40">{index + 1}</span>
                      <h4 className="text-lg font-bold text-white">{exercise.exercise_name}</h4>
                    </div>
                    <button
                      onClick={() => removeExercise(currentWeek, currentDay, index)}
                      className="p-1 hover:bg-red-500/20 rounded transition-colors"
                    >
                      <span className="material-symbols-outlined text-red-400">delete</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-white/60 text-xs mb-1">Sets</label>
                      <input
                        type="number"
                        min="1"
                        value={exercise.sets}
                        onChange={(e) =>
                          updateExercise(
                            currentWeek,
                            currentDay,
                            index,
                            'sets',
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-white/60 text-xs mb-1">Reps</label>
                      <input
                        type="text"
                        value={exercise.reps}
                        onChange={(e) =>
                          updateExercise(currentWeek, currentDay, index, 'reps', e.target.value)
                        }
                        placeholder="8-12"
                        className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-white/60 text-xs mb-1">Rest (sec)</label>
                      <input
                        type="number"
                        min="0"
                        value={exercise.rest_seconds}
                        onChange={(e) =>
                          updateExercise(
                            currentWeek,
                            currentDay,
                            index,
                            'rest_seconds',
                            parseInt(e.target.value) || 60
                          )
                        }
                        className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-white/60 text-xs mb-1">Notes (optional)</label>
                    <input
                      type="text"
                      value={exercise.notes}
                      onChange={(e) =>
                        updateExercise(currentWeek, currentDay, index, 'notes', e.target.value)
                      }
                      placeholder="Form cues, tempo, intensity notes..."
                      className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-sm"
                    />
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>

      {/* Exercise Selection Modal */}
      {showExerciseModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Add Exercise</h3>
              <button
                onClick={() => setShowExerciseModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exercises..."
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              />

              <select
                value={filterMuscle}
                onChange={(e) => setFilterMuscle(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              >
                {muscleGroups.map((muscle) => (
                  <option key={muscle} value={muscle}>
                    {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Exercise List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredExercises.length === 0 ? (
                <p className="col-span-full text-center text-white/60 py-8">
                  No exercises found. Try different filters.
                </p>
              ) : (
                filteredExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="p-4 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors border border-white/10"
                    onClick={() => addExerciseToDay(exercise.id, exercise.name)}
                  >
                    <h4 className="text-white font-semibold mb-2">{exercise.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-white/60 mb-2">
                      {exercise.muscle_groups.map((muscle) => (
                        <span key={muscle} className="px-2 py-0.5 bg-primary/20 rounded">
                          {muscle}
                        </span>
                      ))}
                    </div>
                    <p className="text-white/60 text-sm">
                      {exercise.difficulty} • {exercise.equipment.join(', ')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

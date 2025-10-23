// Comprehensive exercise library with detailed information
export interface Exercise {
  id: string;
  name: string;
  category: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  description: string;
  formTips: string[];
  commonMistakes: string[];
  sets: string;
  reps: string;
  icon: string;
}

export const exerciseLibrary: Exercise[] = [
  // CHEST EXERCISES
  {
    id: 'barbell-bench-press',
    name: 'Barbell Bench Press',
    category: 'chest',
    difficulty: 'intermediate',
    equipment: ['barbell', 'bench'],
    primaryMuscles: ['Pectoralis Major'],
    secondaryMuscles: ['Anterior Deltoid', 'Triceps'],
    description: 'The king of chest exercises. Lie on a flat bench and press the barbell from chest to full arm extension.',
    formTips: [
      'Retract shoulder blades and maintain arch in lower back',
      'Lower bar to mid-chest with elbows at 45-degree angle',
      'Press explosively while keeping feet planted',
      'Maintain wrist alignment over elbows'
    ],
    commonMistakes: [
      'Bouncing the bar off chest',
      'Flaring elbows out to 90 degrees',
      'Lifting hips off bench',
      'Partial range of motion'
    ],
    sets: '3-4',
    reps: '6-10',
    icon: '🏋️'
  },
  {
    id: 'dumbbell-incline-press',
    name: 'Dumbbell Incline Press',
    category: 'chest',
    difficulty: 'intermediate',
    equipment: ['dumbbells', 'incline bench'],
    primaryMuscles: ['Upper Pectoralis Major', 'Clavicular Head'],
    secondaryMuscles: ['Anterior Deltoid', 'Triceps'],
    description: 'Targets upper chest. Set bench to 30-45 degrees and press dumbbells from chest level to overhead.',
    formTips: [
      'Set bench angle between 30-45 degrees',
      'Keep dumbbells aligned over mid-chest',
      'Lower with control until stretch is felt',
      'Press in slight arc bringing dumbbells together at top'
    ],
    commonMistakes: [
      'Bench angle too steep (becomes shoulder press)',
      'Using momentum to lift',
      'Locking out too hard at top',
      'Not achieving full stretch at bottom'
    ],
    sets: '3-4',
    reps: '8-12',
    icon: '💪'
  },

  // BACK EXERCISES
  {
    id: 'deadlift',
    name: 'Conventional Deadlift',
    category: 'back',
    difficulty: 'advanced',
    equipment: ['barbell'],
    primaryMuscles: ['Erector Spinae', 'Latissimus Dorsi', 'Trapezius'],
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Quadriceps', 'Forearms'],
    description: 'The ultimate full-body strength exercise. Lift barbell from floor to hip level while maintaining neutral spine.',
    formTips: [
      'Start with bar over mid-foot, shins nearly touching bar',
      'Grip just outside legs, arms completely straight',
      'Chest up, shoulders over bar, neutral spine',
      'Drive through heels, push floor away',
      'Keep bar close to body throughout lift'
    ],
    commonMistakes: [
      'Rounding lower back',
      'Starting with hips too high or too low',
      'Jerking the weight off floor',
      'Hyperextending at top',
      'Bar drifting away from body'
    ],
    sets: '3-5',
    reps: '3-8',
    icon: '🏋️'
  },
  {
    id: 'pull-ups',
    name: 'Pull-Ups',
    category: 'back',
    difficulty: 'intermediate',
    equipment: ['pull-up bar'],
    primaryMuscles: ['Latissimus Dorsi', 'Teres Major'],
    secondaryMuscles: ['Biceps', 'Posterior Deltoid', 'Trapezius'],
    description: 'Bodyweight vertical pulling exercise. Hang from bar with palms facing away and pull chin over bar.',
    formTips: [
      'Full hang at bottom with arms straight',
      'Initiate pull with lats, not arms',
      'Pull elbows down and back',
      'Bring chin over bar or chest to bar',
      'Lower with control to full extension'
    ],
    commonMistakes: [
      'Using momentum/kipping',
      'Partial range of motion',
      'Shrugging shoulders at top',
      'Swinging legs',
      'Not achieving full hang at bottom'
    ],
    sets: '3-4',
    reps: '6-12',
    icon: '🤸'
  },

  // LEG EXERCISES
  {
    id: 'barbell-squat',
    name: 'Barbell Back Squat',
    category: 'legs',
    difficulty: 'intermediate',
    equipment: ['barbell', 'squat rack'],
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Erector Spinae', 'Core'],
    description: 'The king of leg exercises. Bar on upper back, squat down until thighs are parallel or below, then stand.',
    formTips: [
      'Bar rests on upper traps (high bar) or rear delts (low bar)',
      'Feet shoulder-width, toes slightly out',
      'Break at knees and hips simultaneously',
      'Descend until thighs parallel or below',
      'Drive through heels, keep chest up',
      'Knees track over toes throughout movement'
    ],
    commonMistakes: [
      'Knees caving inward (valgus collapse)',
      'Heels lifting off ground',
      'Excessive forward lean',
      'Not reaching depth',
      'Looking down (neck flexion)'
    ],
    sets: '3-5',
    reps: '6-12',
    icon: '🦵'
  },
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    category: 'legs',
    difficulty: 'intermediate',
    equipment: ['barbell'],
    primaryMuscles: ['Hamstrings', 'Glutes'],
    secondaryMuscles: ['Erector Spinae', 'Lats'],
    description: 'Hip hinge movement targeting posterior chain. Lower bar by pushing hips back, keeping legs nearly straight.',
    formTips: [
      'Start standing with bar at hip level',
      'Push hips back while maintaining slight knee bend',
      'Lower bar down front of legs, feeling hamstring stretch',
      'Stop when you feel maximum stretch (usually mid-shin)',
      'Drive hips forward to return to standing'
    ],
    commonMistakes: [
      'Squatting instead of hinging',
      'Rounding lower back',
      'Bending knees too much',
      'Not feeling stretch in hamstrings',
      'Going too low (past flexibility limits)'
    ],
    sets: '3-4',
    reps: '8-12',
    icon: '🏋️'
  },

  // SHOULDER EXERCISES
  {
    id: 'overhead-press',
    name: 'Standing Overhead Press',
    category: 'shoulders',
    difficulty: 'intermediate',
    equipment: ['barbell'],
    primaryMuscles: ['Anterior Deltoid', 'Middle Deltoid'],
    secondaryMuscles: ['Triceps', 'Upper Chest', 'Core'],
    description: 'Press barbell from shoulder height to overhead lockout while standing.',
    formTips: [
      'Bar rests on front delts at collarbone level',
      'Grip slightly wider than shoulder-width',
      'Brace core and glutes for stability',
      'Press bar straight up, moving head back slightly',
      'Lock out overhead with bar over mid-foot'
    ],
    commonMistakes: [
      'Excessive back arch (hyperextension)',
      'Pressing bar forward instead of straight up',
      'Not achieving full lockout',
      'Using leg drive (making it a push press)',
      'Flaring elbows out too wide'
    ],
    sets: '3-4',
    reps: '6-10',
    icon: '💪'
  },

  // ARM EXERCISES
  {
    id: 'barbell-curl',
    name: 'Barbell Curl',
    category: 'arms',
    difficulty: 'beginner',
    equipment: ['barbell'],
    primaryMuscles: ['Biceps Brachii'],
    secondaryMuscles: ['Brachialis', 'Forearms'],
    description: 'Isolation exercise for biceps. Curl barbell from hip to shoulder level.',
    formTips: [
      'Stand with feet shoulder-width apart',
      'Grip bar at shoulder-width, palms facing up',
      'Keep elbows pinned to sides',
      'Curl bar up while keeping upper arms stationary',
      'Squeeze biceps at top, lower with control'
    ],
    commonMistakes: [
      'Swinging body to generate momentum',
      'Moving elbows forward during curl',
      'Not achieving full range of motion',
      'Lowering too fast (no eccentric control)',
      'Using too much weight'
    ],
    sets: '3-4',
    reps: '8-12',
    icon: '💪'
  },

  // CORE EXERCISES
  {
    id: 'plank',
    name: 'Front Plank',
    category: 'core',
    difficulty: 'beginner',
    equipment: ['none'],
    primaryMuscles: ['Rectus Abdominis', 'Transverse Abdominis'],
    secondaryMuscles: ['Obliques', 'Erector Spinae', 'Shoulders'],
    description: 'Isometric core hold. Maintain straight body position from head to heels.',
    formTips: [
      'Forearms flat on ground, elbows under shoulders',
      'Body in straight line from head to heels',
      'Brace core by pulling belly button to spine',
      'Squeeze glutes to prevent hips sagging',
      'Breathe steadily throughout hold'
    ],
    commonMistakes: [
      'Hips sagging toward ground',
      'Hips too high in air',
      'Looking up (neck hyperextension)',
      'Not engaging core',
      'Holding breath'
    ],
    sets: '3-4',
    reps: '30-60 seconds',
    icon: '🧘'
  },

  // CARDIO
  {
    id: 'running',
    name: 'Running',
    category: 'cardio',
    difficulty: 'beginner',
    equipment: ['running shoes'],
    primaryMuscles: ['Quadriceps', 'Hamstrings', 'Calves'],
    secondaryMuscles: ['Glutes', 'Hip Flexors', 'Core'],
    description: 'Cardiovascular exercise for endurance and fat loss.',
    formTips: [
      'Land on midfoot, not heel',
      'Maintain upright posture',
      'Arms bent at 90 degrees',
      'Relax shoulders',
      'Breathe rhythmically'
    ],
    commonMistakes: [
      'Overstriding (reaching too far forward)',
      'Heel striking',
      'Tense shoulders',
      'Looking down',
      'Increasing mileage too quickly'
    ],
    sets: '1',
    reps: '20-45 minutes',
    icon: '🏃'
  }
];

// Vector search simulation (simple keyword matching)
export function searchExercises(query: string, limit: number = 5): Exercise[] {
  const lowerQuery = query.toLowerCase();

  return exerciseLibrary
    .map(exercise => {
      let score = 0;

      // Check name match
      if (exercise.name.toLowerCase().includes(lowerQuery)) score += 10;

      // Check category match
      if (exercise.category.includes(lowerQuery)) score += 5;

      // Check muscle match
      if (exercise.primaryMuscles.some(m => m.toLowerCase().includes(lowerQuery))) score += 8;
      if (exercise.secondaryMuscles.some(m => m.toLowerCase().includes(lowerQuery))) score += 3;

      // Check equipment match
      if (exercise.equipment.some(e => e.toLowerCase().includes(lowerQuery))) score += 4;

      // Check description match
      if (exercise.description.toLowerCase().includes(lowerQuery)) score += 2;

      return { exercise, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.exercise);
}

// Get exercises by category
export function getExercisesByCategory(category: Exercise['category']): Exercise[] {
  return exerciseLibrary.filter(ex => ex.category === category);
}

// Get exercises by difficulty
export function getExercisesByDifficulty(difficulty: Exercise['difficulty']): Exercise[] {
  return exerciseLibrary.filter(ex => ex.difficulty === difficulty);
}

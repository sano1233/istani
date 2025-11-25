export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscleGroups: string[];
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  sets?: number;
  reps?: string;
  duration?: string;
  restTime?: string;
  imageUrl?: string;
  videoUrl?: string;
  tips: string[];
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  daysPerWeek: number;
  goal: 'strength' | 'endurance' | 'hypertrophy' | 'weight-loss' | 'general-fitness';
  exercises: Exercise[];
  imageUrl?: string;
}

export const exercises: Exercise[] = [
  {
    id: 'push-up',
    name: 'Push-Up',
    description: 'A classic bodyweight exercise that targets the chest, shoulders, and triceps.',
    muscleGroups: ['chest', 'shoulders', 'triceps', 'core'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: [
      'Start in a plank position with hands slightly wider than shoulder-width',
      'Lower your body until chest nearly touches the floor',
      'Keep your core tight and body in a straight line',
      'Push back up to starting position',
      'Repeat for desired reps'
    ],
    sets: 3,
    reps: '10-15',
    restTime: '60 seconds',
    tips: [
      'Keep your elbows at a 45-degree angle to your body',
      'Maintain a neutral spine throughout the movement',
      'Breathe out as you push up, breathe in as you lower down',
      'If too difficult, start with knee push-ups'
    ]
  },
  {
    id: 'squat',
    name: 'Bodyweight Squat',
    description: 'A fundamental lower body exercise that builds leg strength and mobility.',
    muscleGroups: ['quads', 'glutes', 'hamstrings', 'core'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: [
      'Stand with feet shoulder-width apart, toes slightly out',
      'Keep chest up and core engaged',
      'Lower down as if sitting back into a chair',
      'Go as low as comfortable while keeping heels on ground',
      'Push through heels to return to standing'
    ],
    sets: 3,
    reps: '15-20',
    restTime: '60 seconds',
    tips: [
      'Keep knees tracking over toes',
      'Maintain an upright torso',
      'Go as deep as your mobility allows',
      'Warm up with leg swings before squatting'
    ]
  },
  {
    id: 'plank',
    name: 'Plank Hold',
    description: 'An isometric core exercise that builds overall stability and strength.',
    muscleGroups: ['core', 'abs', 'shoulders', 'glutes'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: [
      'Start in a forearm plank position',
      'Elbows directly under shoulders',
      'Body forms a straight line from head to heels',
      'Engage core, squeeze glutes',
      'Hold position while breathing steadily'
    ],
    sets: 3,
    duration: '30-60 seconds',
    restTime: '60 seconds',
    tips: [
      'Don\'t let hips sag or pike up',
      'Keep neck neutral, don\'t drop head',
      'Breathe normally, don\'t hold breath',
      'If too hard, drop to knees'
    ]
  },
  {
    id: 'deadlift',
    name: 'Barbell Deadlift',
    description: 'The king of compound exercises for building total body strength.',
    muscleGroups: ['hamstrings', 'glutes', 'lower-back', 'traps', 'forearms'],
    equipment: ['barbell', 'weights'],
    difficulty: 'intermediate',
    instructions: [
      'Stand with feet hip-width apart, bar over mid-foot',
      'Bend at hips and knees to grip the bar',
      'Keep chest up, shoulders back, core tight',
      'Drive through heels, extend hips and knees',
      'Stand tall at top, then lower with control'
    ],
    sets: 4,
    reps: '5-8',
    restTime: '2-3 minutes',
    tips: [
      'Keep the bar close to your body throughout',
      'Lead with your chest, not your hips',
      'Engage lats to prevent rounding',
      'Start light to perfect form before adding weight'
    ]
  },
  {
    id: 'pull-up',
    name: 'Pull-Up',
    description: 'An advanced upper body exercise for back and arm strength.',
    muscleGroups: ['lats', 'biceps', 'upper-back', 'core'],
    equipment: ['pull-up-bar'],
    difficulty: 'advanced',
    instructions: [
      'Hang from bar with hands slightly wider than shoulders',
      'Palms facing away (pronated grip)',
      'Engage core and pull shoulder blades down',
      'Pull yourself up until chin is over bar',
      'Lower with control to full extension'
    ],
    sets: 3,
    reps: '5-10',
    restTime: '90-120 seconds',
    tips: [
      'Avoid swinging or kipping',
      'Full range of motion for best results',
      'Use resistance bands for assistance if needed',
      'Focus on controlled negative (lowering) phase'
    ]
  },
  {
    id: 'bench-press',
    name: 'Barbell Bench Press',
    description: 'A primary compound movement for chest development.',
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    equipment: ['barbell', 'bench', 'weights'],
    difficulty: 'intermediate',
    instructions: [
      'Lie on bench with feet flat on floor',
      'Grip bar slightly wider than shoulder-width',
      'Unrack bar and position over chest',
      'Lower bar to chest with control',
      'Press bar back to starting position'
    ],
    sets: 4,
    reps: '8-12',
    restTime: '2-3 minutes',
    tips: [
      'Keep shoulder blades retracted and depressed',
      'Maintain slight arch in lower back',
      'Touch chest but don\'t bounce',
      'Always use a spotter for heavy sets'
    ]
  },
  {
    id: 'burpee',
    name: 'Burpee',
    description: 'A full-body exercise that combines strength and cardio.',
    muscleGroups: ['full-body', 'chest', 'legs', 'core'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
    instructions: [
      'Start standing, feet shoulder-width apart',
      'Drop into squat and place hands on ground',
      'Jump feet back into plank position',
      'Perform a push-up (optional)',
      'Jump feet back to hands',
      'Explode up with a jump, reaching overhead'
    ],
    sets: 3,
    reps: '10-15',
    restTime: '90 seconds',
    tips: [
      'Land softly to protect joints',
      'Maintain core engagement throughout',
      'Modify by stepping back instead of jumping',
      'Great for HIIT workouts'
    ]
  },
  {
    id: 'lunge',
    name: 'Walking Lunge',
    description: 'A dynamic lower body exercise for leg strength and balance.',
    muscleGroups: ['quads', 'glutes', 'hamstrings'],
    equipment: ['bodyweight', 'dumbbells'],
    difficulty: 'beginner',
    instructions: [
      'Stand tall with feet hip-width apart',
      'Step forward with one leg',
      'Lower back knee toward ground',
      'Front knee stays over ankle',
      'Push through front heel to step forward with back leg',
      'Continue alternating legs'
    ],
    sets: 3,
    reps: '10-12 per leg',
    restTime: '60 seconds',
    tips: [
      'Keep torso upright throughout movement',
      'Front knee shouldn\'t pass toes',
      'Add dumbbells for increased difficulty',
      'Focus on balance and control'
    ]
  }
];

export const workoutPlans: WorkoutPlan[] = [
  {
    id: 'beginner-full-body',
    name: 'Beginner Full Body Workout',
    description: 'A comprehensive 3-day program for those new to fitness, focusing on building foundational strength and proper form.',
    difficulty: 'beginner',
    duration: '4-6 weeks',
    daysPerWeek: 3,
    goal: 'general-fitness',
    exercises: [
      exercises[0], // Push-up
      exercises[1], // Squat
      exercises[2], // Plank
      exercises[7], // Lunge
    ]
  },
  {
    id: 'intermediate-strength',
    name: 'Intermediate Strength Training',
    description: 'A 4-day split focusing on building raw strength with compound movements.',
    difficulty: 'intermediate',
    duration: '8-12 weeks',
    daysPerWeek: 4,
    goal: 'strength',
    exercises: [
      exercises[3], // Deadlift
      exercises[5], // Bench Press
      exercises[1], // Squat
      exercises[4], // Pull-up
    ]
  },
  {
    id: 'hiit-fat-loss',
    name: 'HIIT Fat Loss Program',
    description: 'High-intensity interval training designed for maximum calorie burn and fat loss.',
    difficulty: 'intermediate',
    duration: '6-8 weeks',
    daysPerWeek: 4,
    goal: 'weight-loss',
    exercises: [
      exercises[6], // Burpee
      exercises[1], // Squat
      exercises[0], // Push-up
      exercises[7], // Lunge
    ]
  },
  {
    id: 'advanced-hypertrophy',
    name: 'Advanced Muscle Building',
    description: 'A 5-day split designed for maximum muscle hypertrophy using progressive overload.',
    difficulty: 'advanced',
    duration: '12-16 weeks',
    daysPerWeek: 5,
    goal: 'hypertrophy',
    exercises: [
      exercises[5], // Bench Press
      exercises[3], // Deadlift
      exercises[4], // Pull-up
      exercises[1], // Squat
    ]
  }
];

export const fitnessTips = [
  {
    id: 'nutrition-basics',
    title: 'Nutrition Fundamentals',
    category: 'nutrition',
    content: 'Proper nutrition is 70% of your fitness journey. Focus on whole foods, adequate protein (0.8-1g per lb bodyweight), complex carbs, and healthy fats. Stay hydrated with at least 8 glasses of water daily.',
    tips: [
      'Eat protein with every meal',
      'Don\'t fear carbs - they fuel your workouts',
      'Meal prep to stay consistent',
      'Track your calories if fat loss is the goal'
    ]
  },
  {
    id: 'recovery-importance',
    title: 'The Power of Recovery',
    category: 'recovery',
    content: 'Muscles grow during rest, not during workouts. Prioritize 7-9 hours of quality sleep, take rest days seriously, and consider active recovery like walking or yoga.',
    tips: [
      'Sleep is your secret weapon',
      'Foam rolling reduces soreness',
      'Take at least 1-2 full rest days per week',
      'Listen to your body - don\'t overtrain'
    ]
  },
  {
    id: 'progressive-overload',
    title: 'Progressive Overload Principle',
    category: 'training',
    content: 'To keep making gains, you must gradually increase the stress on your muscles. This can be more weight, more reps, more sets, or less rest time.',
    tips: [
      'Increase weight by 2.5-5% when you hit rep targets',
      'Keep a training log to track progress',
      'Don\'t increase all variables at once',
      'Consistency beats intensity'
    ]
  },
  {
    id: 'form-over-ego',
    title: 'Form Over Ego',
    category: 'technique',
    content: 'Perfect form prevents injuries and maximizes muscle activation. Leave your ego at the door and lift weights you can control with proper technique.',
    tips: [
      'Record your lifts to check form',
      'Hire a coach if budget allows',
      'Start light and master the movement',
      'Pain is not gain - it\'s injury'
    ]
  },
  {
    id: 'consistency-key',
    title: 'Consistency is King',
    category: 'mindset',
    content: 'The best workout program is the one you\'ll stick to. Showing up 3-4 times per week with decent effort beats sporadic intense sessions.',
    tips: [
      'Schedule workouts like appointments',
      'Find a workout buddy for accountability',
      'Start small and build habits',
      'Progress takes months, not weeks'
    ]
  }
];

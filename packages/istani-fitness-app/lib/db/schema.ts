import { pgTable, text, serial, integer, boolean, timestamp, numeric, jsonb, varchar } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: text('name'),
  passwordHash: text('password_hash'),
  avatar: text('avatar'),
  role: varchar('role', { length: 50 }).default('user'),
  stripeCustomerId: text('stripe_customer_id'),
  subscriptionStatus: varchar('subscription_status', { length: 50 }),
  subscriptionPlan: varchar('subscription_plan', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// User profiles with fitness data
export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  age: integer('age'),
  gender: varchar('gender', { length: 20 }),
  height: numeric('height'), // in cm
  weight: numeric('weight'), // in kg
  goalWeight: numeric('goal_weight'),
  activityLevel: varchar('activity_level', { length: 50 }),
  fitnessGoal: varchar('fitness_goal', { length: 100 }),
  dietaryPreferences: jsonb('dietary_preferences'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Workout plans
export const workoutPlans = pgTable('workout_plans', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  difficulty: varchar('difficulty', { length: 50 }),
  duration: integer('duration'), // in weeks
  daysPerWeek: integer('days_per_week'),
  category: varchar('category', { length: 100 }),
  createdBy: integer('created_by').references(() => users.id),
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Exercises
export const exercises = pgTable('exercises', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }),
  muscleGroup: varchar('muscle_group', { length: 100 }),
  equipment: varchar('equipment', { length: 100 }),
  difficulty: varchar('difficulty', { length: 50 }),
  instructions: jsonb('instructions'),
  videoUrl: text('video_url'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Workout sessions
export const workoutSessions = pgTable('workout_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  workoutPlanId: integer('workout_plan_id').references(() => workoutPlans.id),
  date: timestamp('date').notNull(),
  duration: integer('duration'), // in minutes
  caloriesBurned: numeric('calories_burned'),
  notes: text('notes'),
  completed: boolean('completed').default(false),
  rating: integer('rating'), // 1-5
  createdAt: timestamp('created_at').defaultNow(),
})

// Workout exercises (linking table)
export const workoutExercises = pgTable('workout_exercises', {
  id: serial('id').primaryKey(),
  workoutPlanId: integer('workout_plan_id').references(() => workoutPlans.id).notNull(),
  exerciseId: integer('exercise_id').references(() => exercises.id).notNull(),
  sets: integer('sets'),
  reps: integer('reps'),
  weight: numeric('weight'),
  duration: integer('duration'), // in seconds for cardio
  restTime: integer('rest_time'), // in seconds
  order: integer('order'),
})

// Meal plans
export const mealPlans = pgTable('meal_plans', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  targetCalories: integer('target_calories'),
  macros: jsonb('macros'), // {protein, carbs, fats}
  dietType: varchar('diet_type', { length: 100 }),
  createdBy: integer('created_by').references(() => users.id),
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at').defaultNow(),
})

// Meals
export const meals = pgTable('meals', {
  id: serial('id').primaryKey(),
  mealPlanId: integer('meal_plan_id').references(() => mealPlans.id),
  name: text('name').notNull(),
  type: varchar('type', { length: 50 }), // breakfast, lunch, dinner, snack
  calories: integer('calories'),
  protein: numeric('protein'),
  carbs: numeric('carbs'),
  fats: numeric('fats'),
  ingredients: jsonb('ingredients'),
  instructions: text('instructions'),
  prepTime: integer('prep_time'), // in minutes
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Progress tracking
export const progressEntries = pgTable('progress_entries', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  date: timestamp('date').notNull(),
  weight: numeric('weight'),
  bodyFat: numeric('body_fat'),
  measurements: jsonb('measurements'), // chest, waist, hips, etc.
  photos: jsonb('photos'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  workoutSessions: many(workoutSessions),
  progressEntries: many(progressEntries),
}))

export const workoutPlansRelations = relations(workoutPlans, ({ many }) => ({
  exercises: many(workoutExercises),
  sessions: many(workoutSessions),
}))

export const exercisesRelations = relations(exercises, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}))

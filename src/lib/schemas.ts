import { z } from 'zod';

export const UserProfileSchema = z.object({
  age: z.number().int().min(10).max(100),
  gender: z.enum(['male', 'female', 'other']).default('other'),
  height: z.number().min(100).max(230), // cm
  weight: z.number().min(30).max(300), // kg
  activityLevel: z.number().min(1.1).max(2.5),
  fitnessGoal: z.string().min(2).max(64),
});

export const GeneratePlanRequestSchema = z.object({
  userId: z.string().min(1).max(128),
  planType: z.enum(['workout', 'meal']),
  provider: z.enum(['huggingface', 'gemini', 'claude', 'openrouter']).optional(),
  model: z.string().min(1).max(256).optional(),
  userProfile: UserProfileSchema,
});

export const MultiAgentRequestSchema = z.object({
  userId: z.string().min(1).max(128),
  goal: z.string().min(4).max(2000),
  provider: z.enum(['huggingface', 'gemini', 'claude', 'openrouter']).optional(),
  model: z.string().min(1).max(256).optional(),
  userProfile: UserProfileSchema,
});

export const ProviderSpecSchema = z.union([
  z.enum(['huggingface', 'gemini', 'claude', 'openrouter']).transform((p) => ({ provider: p })),
  z.object({ provider: z.enum(['huggingface', 'gemini', 'claude', 'openrouter']), model: z.string().min(1).max(256).optional() }),
]);

export const EnsemblePlanRequestSchema = z.object({
  userId: z.string().min(1).max(128),
  planType: z.enum(['workout', 'meal']),
  providers: z.array(ProviderSpecSchema).min(1).max(5).optional(),
  synthesizer: ProviderSpecSchema.optional(),
  userProfile: UserProfileSchema,
});

export type GeneratePlanRequest = z.infer<typeof GeneratePlanRequestSchema>;
export type MultiAgentRequest = z.infer<typeof MultiAgentRequestSchema>;
export type EnsemblePlanRequest = z.infer<typeof EnsemblePlanRequestSchema>;


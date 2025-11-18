'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import OnboardingService, {
  type OnboardingProfile,
  type FitnessGoal,
  type ActivityLevel,
  type DietaryPreference,
} from '@/lib/onboarding';

interface OnboardingWizardProps {
  userId: string;
  onComplete: () => void;
}

export default function OnboardingWizard({ userId, onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<Partial<OnboardingProfile>>({
    measurement_system: 'imperial',
    notifications_enabled: true,
    ai_features_enabled: true,
    workout_days_per_week: 3,
  });

  const steps = OnboardingService.getSteps();
  const totalSteps = steps.length;

  const updateProfile = (updates: Partial<OnboardingProfile>) => {
    setProfile({ ...profile, ...updates });
  };

  const handleNext = async () => {
    if (currentStep === totalSteps - 1) {
      // Final step - save and complete
      try {
        await OnboardingService.saveProfile(userId, profile as OnboardingProfile);
        await OnboardingService.completeOnboarding(userId);
        onComplete();
      } catch (error) {
        console.error('Failed to complete onboarding:', error);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">👋</div>
            <h2 className="text-3xl font-bold">Welcome to ISTANI!</h2>
            <p className="text-muted-foreground text-lg">
              Your AI-powered fitness companion is here to help you achieve your goals.
            </p>
            <p className="text-muted-foreground">
              Let's take a few minutes to personalize your experience.
            </p>
          </div>
        );

      case 1: // Basic Info
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profile.name || ''}
                onChange={(e) => updateProfile({ name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email || ''}
                onChange={(e) => updateProfile({ email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={profile.age || ''}
                  onChange={(e) => updateProfile({ age: parseInt(e.target.value) })}
                  placeholder="30"
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  className="w-full px-3 py-2 border rounded-md"
                  value={profile.gender || ''}
                  onChange={(e) =>
                    updateProfile({ gender: e.target.value as 'male' | 'female' | 'other' })
                  }
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2: // Physical Stats
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height">Height (inches)</Label>
                <Input
                  id="height"
                  type="number"
                  value={profile.height || ''}
                  onChange={(e) => updateProfile({ height: parseFloat(e.target.value) })}
                  placeholder="70"
                />
              </div>
              <div>
                <Label htmlFor="current_weight">Current Weight (lbs)</Label>
                <Input
                  id="current_weight"
                  type="number"
                  value={profile.current_weight || ''}
                  onChange={(e) => updateProfile({ current_weight: parseFloat(e.target.value) })}
                  placeholder="180"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="target_weight">Target Weight (lbs) - Optional</Label>
              <Input
                id="target_weight"
                type="number"
                value={profile.target_weight || ''}
                onChange={(e) => updateProfile({ target_weight: parseFloat(e.target.value) })}
                placeholder="170"
              />
            </div>
          </div>
        );

      case 3: // Goals
        return (
          <div className="space-y-4">
            <div>
              <Label>Fitness Goal</Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {[
                  { value: 'lose_weight', label: '🎯 Lose Weight', desc: 'Create a calorie deficit' },
                  { value: 'gain_muscle', label: '💪 Gain Muscle', desc: 'Build strength and size' },
                  { value: 'maintain_weight', label: '⚖️ Maintain Weight', desc: 'Stay at current weight' },
                  { value: 'improve_endurance', label: '🏃 Improve Endurance', desc: 'Increase stamina' },
                  { value: 'general_fitness', label: '✨ General Fitness', desc: 'Overall health' },
                ].map((goal) => (
                  <button
                    key={goal.value}
                    onClick={() => updateProfile({ fitness_goal: goal.value as FitnessGoal })}
                    className={`p-4 text-left border rounded-lg transition-colors ${
                      profile.fitness_goal === goal.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium">{goal.label}</div>
                    <div className="text-sm text-muted-foreground">{goal.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Activity Level</Label>
              <select
                className="w-full px-3 py-2 border rounded-md mt-2"
                value={profile.activity_level || ''}
                onChange={(e) => updateProfile({ activity_level: e.target.value as ActivityLevel })}
              >
                <option value="">Select...</option>
                <option value="sedentary">Sedentary (little or no exercise)</option>
                <option value="lightly_active">Lightly Active (1-3 days/week)</option>
                <option value="moderately_active">Moderately Active (3-5 days/week)</option>
                <option value="very_active">Very Active (6-7 days/week)</option>
                <option value="extremely_active">Extremely Active (athlete)</option>
              </select>
            </div>
            <div>
              <Label htmlFor="workout_days">Workout Days per Week</Label>
              <Input
                id="workout_days"
                type="number"
                min="0"
                max="7"
                value={profile.workout_days_per_week || 3}
                onChange={(e) =>
                  updateProfile({ workout_days_per_week: parseInt(e.target.value) })
                }
              />
            </div>
          </div>
        );

      case 4: // Nutrition
        return (
          <div className="space-y-4">
            <div>
              <Label>Dietary Preference</Label>
              <select
                className="w-full px-3 py-2 border rounded-md mt-2"
                value={profile.dietary_preference || 'none'}
                onChange={(e) =>
                  updateProfile({ dietary_preference: e.target.value as DietaryPreference })
                }
              >
                <option value="none">No Restrictions</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="pescatarian">Pescatarian</option>
                <option value="keto">Keto</option>
                <option value="paleo">Paleo</option>
                <option value="gluten_free">Gluten-Free</option>
                <option value="dairy_free">Dairy-Free</option>
              </select>
            </div>
            <div>
              <Label htmlFor="allergies">Food Allergies (comma-separated)</Label>
              <Input
                id="allergies"
                value={profile.allergies?.join(', ') || ''}
                onChange={(e) =>
                  updateProfile({
                    allergies: e.target.value.split(',').map((a) => a.trim()).filter(Boolean),
                  })
                }
                placeholder="peanuts, shellfish"
              />
            </div>
            {profile.fitness_goal && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Recommended Daily Calories:</p>
                <p className="text-2xl font-bold text-primary">
                  {OnboardingService.calculateDailyCalories(profile).toLocaleString()} kcal
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Based on your profile and {profile.fitness_goal.replace('_', ' ')} goal
                </p>
              </div>
            )}
          </div>
        );

      case 5: // Preferences
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Get reminders and updates</p>
              </div>
              <input
                type="checkbox"
                checked={profile.notifications_enabled}
                onChange={(e) => updateProfile({ notifications_enabled: e.target.checked })}
                className="w-6 h-6"
              />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">AI Features</p>
                <p className="text-sm text-muted-foreground">
                  Photo recognition, voice assistant, smart suggestions
                </p>
              </div>
              <input
                type="checkbox"
                checked={profile.ai_features_enabled}
                onChange={(e) => updateProfile({ ai_features_enabled: e.target.checked })}
                className="w-6 h-6"
              />
            </div>
            <div>
              <Label>Measurement System</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={() => updateProfile({ measurement_system: 'imperial' })}
                  className={`p-3 border rounded-lg ${
                    profile.measurement_system === 'imperial'
                      ? 'border-primary bg-primary/10'
                      : 'border-border'
                  }`}
                >
                  Imperial (lbs, in)
                </button>
                <button
                  onClick={() => updateProfile({ measurement_system: 'metric' })}
                  className={`p-3 border rounded-lg ${
                    profile.measurement_system === 'metric'
                      ? 'border-primary bg-primary/10'
                      : 'border-border'
                  }`}
                >
                  Metric (kg, cm)
                </button>
              </div>
            </div>
          </div>
        );

      case 6: // Integrations
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Connect your favorite fitness devices and apps to automatically sync your data.
            </p>
            {[
              { id: 'apple_health', name: 'Apple Health', icon: '🍎' },
              { id: 'google_fit', name: 'Google Fit', icon: '💚' },
              { id: 'fitbit', name: 'Fitbit', icon: '⌚' },
              { id: 'oura', name: 'Oura Ring', icon: '💍' },
              { id: 'strava', name: 'Strava', icon: '🚴' },
            ].map((device) => (
              <button
                key={device.id}
                onClick={() => {
                  const devices = profile.connected_devices || [];
                  const newDevices = devices.includes(device.id)
                    ? devices.filter((d) => d !== device.id)
                    : [...devices, device.id];
                  updateProfile({ connected_devices: newDevices });
                }}
                className={`w-full p-4 flex items-center justify-between border rounded-lg ${
                  profile.connected_devices?.includes(device.id)
                    ? 'border-primary bg-primary/10'
                    : 'border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{device.icon}</span>
                  <span className="font-medium">{device.name}</span>
                </div>
                <span>
                  {profile.connected_devices?.includes(device.id) ? '✓ Connected' : 'Connect'}
                </span>
              </button>
            ))}
          </div>
        );

      case 7: // Complete
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold">You're All Set!</h2>
            <p className="text-muted-foreground text-lg">
              Your personalized fitness profile is ready.
            </p>
            <div className="p-4 bg-muted rounded-lg text-left">
              <h3 className="font-bold mb-3">Quick Summary:</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  🎯 Goal: {profile.fitness_goal?.replace('_', ' ').toUpperCase()}
                </li>
                <li>
                  📊 Daily Calories: {OnboardingService.calculateDailyCalories(profile)} kcal
                </li>
                <li>
                  🏋️ Workout Days: {profile.workout_days_per_week}/week
                </li>
                <li>
                  🥗 Diet: {profile.dietary_preference || 'None'}
                </li>
                {profile.connected_devices && profile.connected_devices.length > 0 && (
                  <li>
                    📱 Connected Devices: {profile.connected_devices.length}
                  </li>
                )}
              </ul>
            </div>
            <p className="text-muted-foreground">
              Click "Get Started" to begin your journey!
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {totalSteps}
            </span>
          </div>
          <CardDescription>{steps[currentStep].description}</CardDescription>
          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2 mt-4">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">{renderStepContent()}</div>
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            <Button onClick={handleNext}>
              {currentStep === totalSteps - 1 ? 'Get Started' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

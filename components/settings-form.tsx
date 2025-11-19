'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsFormProps {
  profile: any;
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    age: profile?.age || '',
    sex: profile?.sex || '',
    height_cm: profile?.height_cm || '',
    weight_kg: profile?.weight_kg || '',
    body_fat_percentage: profile?.body_fat_percentage || '',
    primary_goal: profile?.primary_goal || 'Fat Loss',
    target_date: profile?.target_date || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowError(false);
    setShowSuccess(false);

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);

      // Refresh the page data
      window.location.reload();
    } catch (error: any) {
      console.error('Update error:', error);
      setErrorMessage(error.message || 'An error occurred while updating your profile');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Success/Error Toast Notifications */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3"
          >
            <span className="material-symbols-outlined">check_circle</span>
            <span className="font-semibold">Profile updated successfully!</span>
          </motion.div>
        )}

        {showError && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 max-w-md"
          >
            <span className="material-symbols-outlined">error</span>
            <div>
              <div className="font-semibold">Update failed</div>
              <div className="text-sm opacity-90">{errorMessage}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-black text-white">Settings</h1>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined mr-2">save</span>
                  Save Changes
                </>
              )}
            </Button>
          </div>

          {/* Profile Header */}
          <div className="mb-10 p-4">
            <div className="flex items-center gap-5">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-5xl">person</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{formData.full_name || 'User'}</h2>
                <p className="text-white/60">
                  Member since{' '}
                  {profile?.member_since &&
                    new Date(profile.member_since).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Section */}
          <Card className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Profile</h2>
            <p className="text-white/60 mb-6">Manage your personal and physical information.</p>

            <h3 className="text-xl font-bold text-white pt-5 pb-3">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                name="full_name"
                placeholder="Jane Doe"
                value={formData.full_name}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="jane@istani.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Age"
                name="age"
                type="number"
                placeholder="28"
                min="13"
                max="120"
                value={formData.age}
                onChange={handleInputChange}
              />
              <div className="flex flex-col">
                <label className="pb-2 text-base font-medium text-white">
                  Sex {formData.sex && <span className="text-white/40 text-sm ml-1">({formData.sex})</span>}
                </label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleInputChange}
                  className="w-full h-12 p-3 text-base font-normal leading-normal text-white bg-white/5 rounded-lg border border-white/10 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                >
                  <option className="bg-background-dark" value="">
                    Prefer not to say
                  </option>
                  <option className="bg-background-dark" value="female">
                    Female
                  </option>
                  <option className="bg-background-dark" value="male">
                    Male
                  </option>
                </select>
              </div>
            </div>

            <h3 className="mt-8 text-xl font-bold text-white pt-5 pb-3">Physical Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Height (cm)"
                name="height_cm"
                type="number"
                placeholder="170"
                min="50"
                max="300"
                step="0.1"
                value={formData.height_cm}
                onChange={handleInputChange}
              />
              <Input
                label="Weight (kg)"
                name="weight_kg"
                type="number"
                placeholder="65"
                min="20"
                max="500"
                step="0.1"
                value={formData.weight_kg}
                onChange={handleInputChange}
              />
              <Input
                label="Body Fat %"
                name="body_fat_percentage"
                type="number"
                placeholder="22"
                min="3"
                max="60"
                step="0.1"
                value={formData.body_fat_percentage}
                onChange={handleInputChange}
              />
            </div>
          </Card>

          {/* Fitness Goals Section */}
          <Card className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Fitness Goals</h2>
            <p className="text-white/60 mb-6">Define what you want to achieve.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="pb-2 text-base font-medium text-white">
                  Primary Goal{' '}
                  {formData.primary_goal && (
                    <span className="text-white/40 text-sm ml-1">({formData.primary_goal})</span>
                  )}
                </label>
                <select
                  name="primary_goal"
                  value={formData.primary_goal}
                  onChange={handleInputChange}
                  className="w-full h-12 p-3 text-base font-normal leading-normal text-white bg-white/5 rounded-lg border border-white/10 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                >
                  <option className="bg-background-dark" value="Fat Loss">
                    Fat Loss
                  </option>
                  <option className="bg-background-dark" value="Muscle Gain">
                    Muscle Gain
                  </option>
                  <option className="bg-background-dark" value="Maintenance">
                    Maintenance
                  </option>
                  <option className="bg-background-dark" value="Improve Endurance">
                    Improve Endurance
                  </option>
                  <option className="bg-background-dark" value="General Fitness">
                    General Fitness
                  </option>
                  <option className="bg-background-dark" value="Athletic Performance">
                    Athletic Performance
                  </option>
                </select>
              </div>
              <Input
                label="Target Date"
                name="target_date"
                type="date"
                value={formData.target_date}
                onChange={handleInputChange}
              />
            </div>
          </Card>

          {/* Save Button at Bottom */}
          <div className="flex justify-end mb-8">
            <Button type="submit" disabled={isSubmitting} size="lg">
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                  Saving Changes...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined mr-2">save</span>
                  Save All Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}

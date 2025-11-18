'use client';

import { useRouter } from 'next/navigation';
import OnboardingWizard from '@/components/onboarding-wizard';

export default function OnboardingPage() {
  const router = useRouter();

  const handleComplete = () => {
    // Redirect to dashboard after onboarding
    router.push('/dashboard');
  };

  // Mock user ID - in production, get from auth context
  const userId = 'mock-user-id';

  return <OnboardingWizard userId={userId} onComplete={handleComplete} />;
}

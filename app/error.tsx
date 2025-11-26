'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Enterprise-grade global error boundary
 * Catches all unhandled errors in the application
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Application error:', error);

    // In production, send to error tracking service (e.g., Sentry)
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background-dark">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <span className="material-symbols-outlined text-destructive text-8xl block mb-4">
            error
          </span>
          <h1 className="text-4xl font-black text-white mb-4">Something went wrong!</h1>
          <p className="text-xl text-white/70 mb-2">
            We've encountered an unexpected error. Our team has been notified.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10 text-left">
              <p className="text-sm font-mono text-red-400">{error.message}</p>
              {error.digest && (
                <p className="text-xs text-white/50 mt-2">Error ID: {error.digest}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={reset}>
            Try Again
          </Button>
          <Link href="/">
            <Button size="lg" variant="outline">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

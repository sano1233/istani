'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Dashboard error:', error);
    // TODO: Send to Sentry or other error tracking service
  }, [error]);

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8">
          {/* Error Icon */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-red-500 text-5xl">error</span>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-black text-white text-center mb-4">
            Oops! Something went wrong
          </h1>
          <p className="text-white/60 text-center mb-8">
            We encountered an unexpected error while loading this page. Don't worry, your data is safe.
          </p>

          {/* Error Details (Development Mode) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-8 p-4 bg-black/30 rounded-lg border border-white/10">
              <h2 className="text-lg font-bold text-white mb-2">Error Details</h2>
              <pre className="text-sm text-red-400 overflow-x-auto whitespace-pre-wrap break-words">
                {error.message}
              </pre>
              {error.digest && (
                <p className="text-xs text-white/40 mt-2">Error ID: {error.digest}</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={reset} variant="outline">
              <span className="material-symbols-outlined mr-2">refresh</span>
              Try Again
            </Button>
            <Button onClick={() => (window.location.href = '/dashboard')}>
              <span className="material-symbols-outlined mr-2">home</span>
              Go to Dashboard
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-white/40 text-sm text-center mt-8">
            If this problem persists, please try refreshing the page or clearing your browser cache.
          </p>
        </div>
      </div>
    </div>
  );
}

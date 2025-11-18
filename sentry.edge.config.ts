import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set environment
  environment: process.env.NODE_ENV || 'development',

  // Adjust the sample rate for performance monitoring
  // Edge runtime has stricter limits, so sample less
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,

  // Don't send events from development
  beforeSend(event) {
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
});

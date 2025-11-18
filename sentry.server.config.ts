import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set environment
  environment: process.env.NODE_ENV || 'development',

  // Adjust the sample rate for performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Set sampling rate for profiling - this will profile 10% of transactions
  profilesSampleRate: 0.1,

  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps

  integrations: [
    // Add profiling
    new Sentry.ProfilingIntegration(),
  ],

  // Ignore specific errors
  ignoreErrors: [
    // Ignore cancelled requests
    'AbortError',
    'cancelled',
  ],

  // Don't send events from development
  beforeSend(event) {
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },

  // Custom breadcrumbs
  beforeBreadcrumb(breadcrumb) {
    // Don't log console breadcrumbs in production
    if (breadcrumb.category === 'console' && process.env.NODE_ENV === 'production') {
      return null;
    }
    return breadcrumb;
  },
});

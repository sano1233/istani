import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set environment
  environment: process.env.NODE_ENV || 'development',

  // Adjust the sample rate for performance monitoring
  // 0.1 = 10% of transactions will be sent to Sentry
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Set sampling rate for profiling
  profilesSampleRate: 0.1,

  // This sets the sample rate to be 10% for Session Replay
  replaysSessionSampleRate: 0.1,

  // If the entire session is not sampled, use the below sample rate to sample
  // sessions when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    new Sentry.BrowserTracing({
      // Set custom tags for better organization
      beforeNavigate: (context) => {
        return {
          ...context,
          // Add custom tags
          tags: {
            ...context.tags,
          },
        };
      },
    }),
    new Sentry.Replay({
      // Mask all text content for privacy
      maskAllText: true,
      // Block all media (images, video, audio)
      blockAllMedia: true,
    }),
  ],

  // Ignore specific errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'Can\'t find variable: ZiteReader',
    'jigsaw is not defined',
    'ComcastIntelligentMonitoring',
    // Facebook borked
    'fb_xd_fragment',
    // ISP injections
    'bmi_SafeAddOnload',
    'EBCallBackMessageReceived',
    // Random plugins/extensions
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    // Network errors
    'NetworkError',
    'ChunkLoadError',
  ],

  // Don't send events from development
  beforeSend(event) {
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
});

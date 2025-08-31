// Lightweight telemetry stubs. Replace with real Sentry/PostHog as needed.

export function initTelemetry() {
  // Example: Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN, tracesSampleRate: 1.0 });
  // Example: posthog.init(import.meta.env.VITE_POSTHOG_KEY, { api_host: 'https://app.posthog.com' });
  // No-op by default
}

export function captureError(error: unknown, context?: Record<string, unknown>) {
  console.error('Telemetry error:', error, context);
}

export function captureEvent(name: string, props?: Record<string, unknown>) {
  console.log('Telemetry event:', name, props);
}



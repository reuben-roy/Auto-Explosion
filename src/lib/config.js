// Analytics Configuration
// Set these environment variables for PostHog analytics

export const POSTHOG_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_API_KEY || '';
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';
export const POSTHOG_ENABLED = !!POSTHOG_API_KEY;
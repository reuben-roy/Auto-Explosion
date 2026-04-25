'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';
import { POSTHOG_API_KEY, POSTHOG_HOST } from './config';

export default function AnalyticsProvider() {
  useEffect(() => {
    if (!POSTHOG_API_KEY || typeof window === 'undefined') return;

    // Don't capture in development
    if (process.env.NODE_ENV === 'development') {
      posthog.capture = () => {};
      posthog.submit = () => {};
    }

    posthog.init(POSTHOG_API_KEY, {
      api_host: POSTHOG_HOST || 'https://app.posthog.com',
      person_profiles: 'always',
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      session_recording: {
        maskAllInputs: true,
        maskNetworkRequests: false,
      },
      bootstrap: {
        featureFlags: {
          // Enable feature flags early
        },
      },
    });

    // Track page navigations
    const handleRouteChange = () => {
      posthog.capture('$pageview');
    };

    // Subscribe to route changes if using App Router
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return null;
}
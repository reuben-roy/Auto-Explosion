'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';
import { POSTHOG_API_KEY, POSTHOG_HOST } from './config';

export function initPostHog() {
  if (typeof window !== 'undefined' && POSTHOG_API_KEY) {
    posthog.init(POSTHOG_API_KEY, {
      api_host: POSTHOG_HOST || 'https://app.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      session_recording: {
        maskAllInputs: true,
      },
      toolbar: process.env.NODE_ENV === 'development',
    });
  }
}

export function usePostHogPageView() {
  useEffect(() => {
    initPostHog();
  }, []);
}
// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

import serverEnv from "./src/env/server";
import { SENTRY_DSN } from "./src/lib/sentry/constants";

Sentry.init({
  dsn: SENTRY_DSN,

  // Use configurable sample rate from environment
  // Default: 100% on Vercel, 100% in development, 10% in production outside Vercel
  tracesSampleRate:
    serverEnv.SENTRY_TRACES_SAMPLE_RATE ??
    (process.env.NODE_ENV === "production"
      ? process.env.VERCEL_URL
        ? 1.0 // Production on Vercel: 100%
        : 0.1 // Production outside Vercel: 10%
      : 1.0), // Development: 100%

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: true,
  enabled: true,

  // Note: release is automatically set by the Sentry Next.js plugin
  // based on VERCEL_GIT_COMMIT_SHA or local git state
});

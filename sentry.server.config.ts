// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

import serverEnv from "./src/env/server";
import { getDeploymentId } from "./src/lib/metrics/deployment-id";

Sentry.init({
  dsn: "https://f2637ad11c46daf54b4ad6b1f2f22cdd@o65222.ingest.us.sentry.io/4509389251674112",

  // Use configurable sample rate from environment
  // Default: 100% on Vercel, 100% in development, 10% in production outside Vercel
  tracesSampleRate:
    serverEnv.SENTRY_TRACES_SAMPLE_RATE ??
    (process.env.NODE_ENV === "production"
      ? serverEnv.VERCEL_DEPLOYMENT_ID
        ? 1.0 // Production on Vercel: 100%
        : 0.1 // Production outside Vercel: 10%
      : 1.0), // Development: 100%

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  enabled: process.env.NODE_ENV === "production",

  beforeSend: (event) => {
    // Add deployment tag for filtering metrics by deployment
    event.tags = {
      ...event.tags,
      deployment: getDeploymentId(),
    };
    return event;
  },
});

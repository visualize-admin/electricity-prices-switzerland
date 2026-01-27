import * as Sentry from "@sentry/nextjs";

import type { NextApiRequest, NextApiResponse } from "next";

/**
 * GET /api/admin/metrics/clear
 *
 * Clears all metrics for the current release.
 *
 * Note: Sentry metrics cannot be cleared via API. This endpoint is kept for
 * backward compatibility but always returns cleared: false.
 *
 * Availability: Development environments only (NODE_ENV !== 'production')
 * Returns 404 in production.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only available in non-production environments
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ error: "Not found" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const client = Sentry.getClient();
  const release = client?.getOptions().release || "unknown";

  res.status(200).json({
    cleared: false,
    release,
    message: "Clear metrics not supported with Sentry backend",
  });
}

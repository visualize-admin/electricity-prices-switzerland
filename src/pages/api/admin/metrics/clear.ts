import { getDeploymentId } from "src/lib/metrics/deployment-id";
import { clearMetrics } from "src/lib/metrics/metrics-store";

import type { NextApiRequest, NextApiResponse } from "next";

/**
 * GET /api/admin/metrics/clear
 *
 * Clears all metrics for the current deployment.
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

  try {
    const deploymentId = getDeploymentId();
    const cleared = await clearMetrics();

    res.status(200).json({
      cleared,
      deploymentId,
    });
  } catch (error) {
    console.error("[Metrics API] Error clearing metrics:", error);
    res.status(500).json({
      error: "Failed to clear metrics",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

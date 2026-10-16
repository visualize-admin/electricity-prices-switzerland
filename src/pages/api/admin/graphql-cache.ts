import { NextApiRequest, NextApiResponse } from "next";

import { getGraphqlCacheInfo } from "src/lib/graphql-cache";

/**
 * GET /api/admin/graphql-cache
 *
 * Tells which backend serves the GraphQL response cache (Redis or in-memory)
 * and its state.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json(await getGraphqlCacheInfo());
}

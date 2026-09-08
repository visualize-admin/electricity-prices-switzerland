import { NextApiRequest, NextApiResponse } from "next";

import { validateCSRFToken } from "src/admin-auth/crsf";
import { parseSessionFromRequest } from "src/admin-auth/session";
import { clearProcessCache, ProcessCacheId } from "src/lib/process-caches";

const REDIRECT_URL = "/admin/caches";

const CACHE_IDS = new Set<ProcessCacheId | "all">([
  "all",
  "csv-export",
  "coverage-ratio",
  "electricity-price-observations",
  "search-index",
]);

const redirect = (
  res: NextApiResponse,
  params: { message?: string; error?: string }
) => {
  const searchParams = new URLSearchParams();
  if (params.message) searchParams.set("message", params.message);
  if (params.error) searchParams.set("error", params.error);
  const query = searchParams.toString();
  return res.redirect(303, query ? `${REDIRECT_URL}?${query}` : REDIRECT_URL);
};

/**
 * POST /api/admin/caches
 *
 * Clears one in-process cache, or all of them. Only this server instance.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return redirect(res, { error: "Method not allowed" });
  }

  const session = await parseSessionFromRequest(req);
  if (!session) {
    return res.redirect(303, "/admin/login?return_to=/admin/caches");
  }

  const csrfToken = String(req.body?.csrfToken ?? "");
  if (!csrfToken || !validateCSRFToken(csrfToken, session.sessionId)) {
    return redirect(res, {
      error: "Invalid or expired form. Please try again.",
    });
  }

  const id = String(req.body?.id ?? "") as ProcessCacheId | "all";
  if (!CACHE_IDS.has(id)) {
    return redirect(res, { error: "Unknown cache." });
  }

  try {
    clearProcessCache(id);
  } catch (error) {
    return redirect(res, {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return redirect(res, {
    message:
      id === "all"
        ? "Cleared all in-process caches on this instance."
        : `Cleared ${id} on this instance.`,
  });
}

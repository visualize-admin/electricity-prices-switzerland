import { NextApiRequest, NextApiResponse } from "next";

import { validateCSRFToken } from "src/admin-auth/crsf";
import { parseSessionFromRequest } from "src/admin-auth/session";
import { clearProcessCache, listProcessCaches } from "src/lib/process-caches";

const REDIRECT_URL = "/admin/caches";

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
 * GET /api/admin/caches
 *
 * Lists the process caches with their entry counts. Served from an API
 * route since API routes have their own module instances (and so their own
 * in-memory caches) separate from the getServerSideProps of pages.
 *
 * POST /api/admin/caches
 *
 * Clears one process cache, or all of them. Caches stored in Redis are cleared
 * for all instances, in-memory ones only on this server instance.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const session = await parseSessionFromRequest(req);
    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(await listProcessCaches());
  }

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

  const id = String(req.body?.id ?? "");

  try {
    await clearProcessCache(id);
  } catch (error) {
    return redirect(res, {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return redirect(res, {
    message: id === "all" ? "Cleared all process caches." : `Cleared ${id}.`,
  });
}

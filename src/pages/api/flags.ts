import serverEnv from "src/env/server";

import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Return the runtime flags from server environment
    res.status(200).json({ flags: serverEnv.FLAGS });
  } catch (error) {
    console.error("Error getting flags:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

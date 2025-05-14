import { NextApiRequest, NextApiResponse } from "next";

import { createSignedPreviewCookie, validatePassword } from "src/lib/auth";
import { COOKIE_NAME } from "src/middleware";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { password } = req.body;

  if (!validatePassword(password)) {
    return res.status(401).send("Unauthorized");
  }

  res.setHeader("Set-Cookie", [
    `${COOKIE_NAME}=${createSignedPreviewCookie()}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
  ]);

  res.status(200).json({ success: true });
}

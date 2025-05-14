import crypto from "crypto";

import { NextApiRequest } from "next";
import { NextRequest } from "next/server";

import { COOKIE_NAME } from "src/middleware";

const SIGNING_SECRET = process.env.PREVIEW_COOKIE_SECRET!;
const PASSWORD_HASH = process.env.PREVIEW_PASSWORD_HASH!;

if (!SIGNING_SECRET) throw new Error("Missing PREVIEW_COOKIE_SECRET");
if (!PASSWORD_HASH) throw new Error("Missing PREVIEW_PASSWORD_HASH");

function createHmac(data: string): string {
  return crypto.createHmac("sha256", SIGNING_SECRET).update(data).digest("hex");
}

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function validatePassword(input: string): boolean {
  const inputHash = hashPassword(input);
  return crypto.timingSafeEqual(
    Buffer.from(inputHash),
    Buffer.from(PASSWORD_HASH)
  );
}

export function createSignedPreviewCookie(value: string = "1"): string {
  const signature = createHmac(value);
  return `${value}.${signature}`;
}

export function isValidSignedPreviewCookie(
  cookieValue: string | undefined
): boolean {
  if (!cookieValue) return false;

  const [value, signature] = cookieValue.split(".");
  if (!value || !signature) return false;

  const expectedSig = createHmac(value);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSig)
  );
}

export function isAuthedApiRequest(req: NextApiRequest): boolean {
  const cookieHeader = req.headers.cookie ?? "";
  const cookie = Object.fromEntries(
    cookieHeader.split("; ").map((c) => c.split("="))
  )[COOKIE_NAME];
  return isValidSignedPreviewCookie(cookie);
}

export function isAuthedEdgeRequest(req: NextRequest): boolean {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  return isValidSignedPreviewCookie(cookie);
}

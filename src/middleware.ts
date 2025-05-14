import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export const COOKIE_NAME = "preview_auth";

const encoder = new TextEncoder();
const SECRET = process.env.PREVIEW_COOKIE_SECRET!;
if (!SECRET) throw new Error("Missing PREVIEW_COOKIE_SECRET");

export async function isValidSignedPreviewCookie(
  cookieValue?: string
): Promise<boolean> {
  if (!cookieValue) return false;

  const [value, sig] = cookieValue.split(".");
  if (!value || !sig) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const expected = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  const expectedHex = Buffer.from(expected).toString("hex");

  return (
    expectedHex.length === sig.length &&
    expectedHex
      .split("")
      .reduce((acc, c, i) => acc | (c.charCodeAt(0) ^ sig.charCodeAt(i)), 0) ===
      0
  );
}

export async function middleware(req: NextRequest) {
  if (process.env.VERCEL_ENV !== "preview") return NextResponse.next();
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname.match(/\.(.*)$/)
  ) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  if (
    (await isValidSignedPreviewCookie(cookie)) ||
    pathname === "/_preview-auth"
  ) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/_preview-auth", req.url));
}

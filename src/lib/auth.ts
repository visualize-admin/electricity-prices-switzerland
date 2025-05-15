import crypto from "crypto";

const SIGNING_SECRET = process.env.PREVIEW_COOKIE_SECRET!;
const PASSWORD_HASH = process.env.PREVIEW_PASSWORD_HASH!;

if (!SIGNING_SECRET) throw new Error("Missing PREVIEW_COOKIE_SECRET");
if (!PASSWORD_HASH) throw new Error("Missing PREVIEW_PASSWORD_HASH");

function createHmac(data: string): string {
  return crypto.createHmac("sha256", SIGNING_SECRET).update(data).digest("hex");
}

function hashPassword(password: string): string {
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

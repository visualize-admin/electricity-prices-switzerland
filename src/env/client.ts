import z from "zod";

const FlagSchema = z.array(z.string());

const clientSchema = z.object({
  NEXT_PUBLIC_VERCEL_ENV: z.string().optional(),
  NEXT_PUBLIC_FLAGS: z
    .string()
    .optional()
    .transform((flags) => {
      if (!flags) return [];
      try {
        return FlagSchema.parse(JSON.parse(flags));
      } catch (error) {
        console.error("Failed to parse NEXT_PUBLIC_FLAGS:", error);
        return [];
      }
    }),
});

export default clientSchema.parse({
  NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
  NEXT_PUBLIC_FLAGS: process.env.NEXT_PUBLIC_FLAGS,
});

const isRunningInBrowser = () => {
  return typeof window !== "undefined";
};

declare global {
  interface Window {
    __clientEnv__: Record<string, string | undefined>;
  }
}

/**
 * Client and server-side **RUNTIME** variables
 *
 * These values are exposed in pages/_document.tsx to the browser or read from process.env on the server-side.
 * Note: we can't destructure process.env because it's mangled in the Next.js runtime
 */

const clientEnv = isRunningInBrowser() ? window.__clientEnv__ : undefined;

export const PUBLIC_URL = (
  clientEnv?.PUBLIC_URL ??
  process.env.PUBLIC_URL ??
  process.env.NEXT_PUBLIC_PUBLIC_URL ??
  ""
).replace(/\/$/, "");

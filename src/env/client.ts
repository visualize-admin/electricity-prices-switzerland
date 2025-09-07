import z from "zod";

const clientBuildSchema = z.object({
  NEXT_PUBLIC_VERCEL_ENV: z.string().optional(),
});

export const clientBuildEnv = clientBuildSchema.parse({
  NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
});

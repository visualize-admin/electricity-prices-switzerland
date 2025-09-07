import z from "zod";

const FlagSchema = z.array(z.string());

const clientBuildSchema = z.object({
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

export const clientBuildEnv = clientBuildSchema.parse({
  NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
  NEXT_PUBLIC_FLAGS: process.env.NEXT_PUBLIC_FLAGS,
});

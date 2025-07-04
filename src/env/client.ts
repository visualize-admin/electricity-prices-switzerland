import z from "zod";

const clientSchema = z.object({
  NEXT_PUBLIC_VERCEL_ENV: z.string().optional(),
  NEXT_PUBLIC_FLAGS: z.string().optional(),
});

export default clientSchema.parse({
  NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
  NEXT_PUBLIC_FLAGS: process.env.NEXT_PUBLIC_FLAGS,
});

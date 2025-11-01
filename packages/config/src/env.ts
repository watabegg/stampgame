import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_BASE: z.string().url(),
  NEXT_PUBLIC_BETTER_AUTH_CLIENT_ID: z.string().min(1),
});

export type RuntimeEnv = z.infer<typeof envSchema>;

export function loadEnv(vars: Record<string, string | undefined>): RuntimeEnv {
  return envSchema.parse(vars);
}

export const env = loadEnv({
  NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
  NEXT_PUBLIC_BETTER_AUTH_CLIENT_ID: process.env.NEXT_PUBLIC_BETTER_AUTH_CLIENT_ID,
});

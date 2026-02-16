import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().optional(),
  BETTER_AUTH_SECRET: z.string().optional(),
  BETTER_AUTH_URL: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_PUBLIC_URL: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db';
import { env } from '@/lib/env';

const authUrl = env.BETTER_AUTH_URL || 'http://localhost:3000';
const authSecret = env.BETTER_AUTH_SECRET || 'placeholder-secret-key-min-32-chars';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  trustedOrigins: [authUrl],
  secret: authSecret,
  baseURL: authUrl,
  basePath: '/api/auth',
});

export type Session = typeof auth.$Infer.Session.session;

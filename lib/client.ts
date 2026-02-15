import { createAuthClient } from 'better-auth/client';
import type { auth } from '@/lib/auth';

export const client = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
});

// Export typed hooks and methods
export const { 
  useSession, 
  signIn, 
  signOut, 
  signUp,
  getSession,
} = client;

// Export types
export type AuthClient = typeof client;
export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;

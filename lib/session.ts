import { auth } from '@/lib/auth';
import { cookies } from 'next/headers';
import { cache } from 'react';

/**
 * Get the current session from the request cookies
 * Uses React cache() to deduplicate requests in the same render
 */
export const getSession = cache(async () => {
  try {
    const cookieStore = await cookies();
    const session = await auth.api.getSession({
      headers: {
        cookie: cookieStore.toString(),
      },
    });
    return session;
  } catch {
    return null;
  }
});

/**
 * Get the current user from the session
 */
export const getUser = cache(async () => {
  const session = await getSession();
  return session?.user ?? null;
});

/**
 * Check if user is authenticated
 */
export const isAuthenticated = cache(async () => {
  const session = await getSession();
  return !!session;
});

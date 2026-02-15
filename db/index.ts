import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error('DATABASE_URL is required');
}

const sql = neon(dbUrl);
export const db = drizzle(sql, { schema });

/**
 * Get database instance
 * Use this in server components and actions
 */
export function getDb() {
  return db;
}

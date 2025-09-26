import { drizzle, type NeonDatabase } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import * as schema from '@/lib/db/schema';

import ws from 'ws';
neonConfig.webSocketConstructor = ws; // open connections via websocket in node
neonConfig.poolQueryViaFetch = true; // run pool queries over fetch on serverless edge

export const tables = schema;
export type PGDatabase = NeonDatabase<typeof schema>;

const inDev = process.env.NODE_ENV !== 'production';
let _db: PGDatabase | null = null;

export function drizzleDB() {
  if (_db) return _db;
  console.log('Dev mode:', inDev);

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('❌ DATABASE_URL is unset.');

  const pool = new Pool({ connectionString });
  _db = drizzle(pool);

  return _db;
}

const { companies } = tables;
export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
export { and, eq, ilike, inArray, like, or } from 'drizzle-orm';

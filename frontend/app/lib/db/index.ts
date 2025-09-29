import { drizzle, type NeonDatabase } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import * as schema from '@/lib/db/schema';
import { consola } from 'consola';
import { resolve } from 'path';

import ws from 'ws';
neonConfig.webSocketConstructor = ws; // open connections via websocket in node
neonConfig.poolQueryViaFetch = true; // run pool queries over fetch on serverless edge

export const tables = schema;
export type PGDatabase = NeonDatabase<typeof schema>;

export const inDev = process.env.NODE_ENV !== 'production';
export const rootDir = resolve(__dirname, '../../../../');

let _db: PGDatabase | null = null;

export function drizzleDB() {
  if (_db) return _db;
  consola.info('Dev mode:', inDev);

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('❌ DATABASE_URL is unset.');

  const pool = new Pool({ connectionString });
  _db = drizzle(pool);

  return _db;
}

const { companies } = tables;
export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
export { and, eq, ilike, inArray, like, or, sql } from 'drizzle-orm';

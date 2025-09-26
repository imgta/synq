import { defineConfig, type Config } from 'drizzle-kit';
import { loadEnvConfig } from '@next/env';
import path from 'path';

const rootDir = path.resolve(__dirname, '..');
const inDev = process.env.NODE_ENV !== 'production';

loadEnvConfig(rootDir, inDev);

export default defineConfig({
  out: inDev ? './.drizzle/migrations' : './app/lib/db/migrations',
  schema: './app/lib/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
} satisfies Config);
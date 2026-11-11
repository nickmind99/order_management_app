import { existsSync } from 'node:fs';
import { defineConfig } from 'prisma/config';

// Locally DATABASE_URL comes from the root .env; in CI/prod it is already set.
if (existsSync('../../.env')) process.loadEnvFile('../../.env');

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations', seed: 'tsx prisma/seed.ts' },
  datasource: { url: process.env.DATABASE_URL ?? '' },
});

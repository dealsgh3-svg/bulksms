import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // Falls back to pooled URL if unpooled is missing (useful for Vercel injection)
    url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});

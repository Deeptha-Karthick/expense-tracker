import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

// Local dev reads .env.local; CI and production use real environment variables.
if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});

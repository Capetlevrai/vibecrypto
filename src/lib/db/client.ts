import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

function resolveUrl(): string {
  const env = process.env.TURSO_DATABASE_URL;
  if (env && env.trim().length > 0) return env.trim();
  return "file:local.db";
}

const client = createClient({
  url: resolveUrl(),
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
export { schema };

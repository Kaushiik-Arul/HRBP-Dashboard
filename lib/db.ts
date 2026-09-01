import "server-only";

import { Pool } from "pg";

declare global {
  var hrbpDatabasePool: Pool | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("Database configuration is unavailable.");

  return new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    application_name: "hrbp-dashboard",
  });
}

export function database() {
  const pool = globalThis.hrbpDatabasePool ?? createPool();
  if (process.env.NODE_ENV !== "production") globalThis.hrbpDatabasePool = pool;
  return pool;
}
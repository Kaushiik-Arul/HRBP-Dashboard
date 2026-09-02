import { readFile } from "node:fs/promises";
import pg from "pg";

const file = process.argv[2];
if (!file) throw new Error("Usage: node scripts/run-sql.mjs <path-to-sql>");

const sql = await readFile(file, "utf8");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

try {
  await pool.query(sql);
  console.log(`Applied ${file}`);
} finally {
  await pool.end();
}

import "server-only";

import { database } from "@/lib/db";

import type { SafeUser } from "./types";

type CredentialRecord = SafeUser & {
  passwordHash: string;
  status: string;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
};

type AccountRow = {
  id: string;
  name: string;
  email: string;
  hrbp_id: number;
  role: string;
};

const safeUserColumns = `id, name, email, hrbp_id, role`;

function safeUser(row: AccountRow): SafeUser {
  return { id: row.id, name: row.name, email: row.email, hrbpId: row.hrbp_id, role: row.role };
}

export async function findCredentials(email: string): Promise<CredentialRecord | null> {
  const result = await database().query<
    AccountRow & {
      password_hash: string;
      status: string;
      failed_login_attempts: number;
      locked_until: Date | null;
    }
  >(
    `SELECT ${safeUserColumns}, password_hash, status, failed_login_attempts, locked_until
     FROM master_access
     WHERE LOWER(email) = $1
     LIMIT 1`,
    [email],
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    ...safeUser(row),
    passwordHash: row.password_hash,
    status: row.status,
    failedLoginAttempts: row.failed_login_attempts,
    lockedUntil: row.locked_until,
  };
}

export async function findActiveUser(id: string): Promise<SafeUser | null> {
  const result = await database().query<AccountRow>(
    `SELECT ${safeUserColumns}
     FROM master_access
     WHERE id = $1 AND status = 'active' AND (locked_until IS NULL OR locked_until <= CURRENT_TIMESTAMP)
     LIMIT 1`,
    [id],
  );
  return result.rows[0] ? safeUser(result.rows[0]) : null;
}

export async function recordFailedLogin(id: string) {
  await database().query(
    `UPDATE master_access
     SET failed_login_attempts = failed_login_attempts + 1,
         locked_until = CASE WHEN failed_login_attempts + 1 >= 5 THEN CURRENT_TIMESTAMP + INTERVAL '15 minutes' ELSE locked_until END,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [id],
  );
}

export async function recordSuccessfulLogin(id: string) {
  await database().query(
    `UPDATE master_access
     SET failed_login_attempts = 0, locked_until = NULL, last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [id],
  );
}

export async function createAccount(input: {
  name: string;
  email: string;
  passwordHash: string;
  hrbpId: number;
}) {
  await database().query(
    `INSERT INTO master_access (name, email, password_hash, hrbp_id)
     VALUES ($1, $2, $3, $4)`,
    [input.name, input.email, input.passwordHash, input.hrbpId],
  );
}
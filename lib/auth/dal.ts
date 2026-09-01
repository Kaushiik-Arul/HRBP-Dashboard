import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE } from "./constants";
import { findActiveUser } from "./repository";
import { verifySession } from "./session";

export async function currentUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const userId = await verifySession(token);
  return userId ? findActiveUser(userId) : null;
}

export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  return user;
}
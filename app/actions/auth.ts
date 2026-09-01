"use server";

import { redirect } from "next/navigation";

import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  createAccount,
  findCredentials,
  recordFailedLogin,
  recordSuccessfulLogin,
} from "@/lib/auth/repository";
import { createSession, deleteSession } from "@/lib/auth/session";
import type { AuthFormState } from "@/lib/auth/types";
import { createAccountSchema, formValues, signInSchema } from "@/lib/auth/validation";

const DUMMY_PASSWORD_HASH = "$2b$12$S0/hB7r7litbp6uoTXMqEOrM2C2NczW/hiX0eEClxSByiyx8yIGL2";

export async function signIn(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse(formValues(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  try {
    const account = await findCredentials(parsed.data.email);
    const passwordMatches = await verifyPassword(parsed.data.password, account?.passwordHash ?? DUMMY_PASSWORD_HASH);
    const locked = account?.lockedUntil && account.lockedUntil > new Date();

    if (!account || !passwordMatches || account.status !== "active" || locked) {
      if (account && !passwordMatches) await recordFailedLogin(account.id);
      return { message: "Invalid email or password." };
    }

    await recordSuccessfulLogin(account.id);
    await createSession(account.id);
  } catch {
    return { message: "Sign-in is temporarily unavailable. Please try again." };
  }

  redirect("/");
}

export async function createUserAccount(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = createAccountSchema.safeParse(formValues(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  try {
    const passwordHash = await hashPassword(parsed.data.password);
    await createAccount({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      hrbpId: parsed.data.hrbpId,
    });
    return { success: true, message: "Account created successfully." };
  } catch {
    return { message: "The account could not be created. Check the details and try again." };
  }
}

export async function signOut() {
  await deleteSession();
  redirect("/sign-in");
}
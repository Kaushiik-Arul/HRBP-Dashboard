"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

import { signIn } from "@/app/actions/auth";
import type { AuthFormState } from "@/lib/auth/types";

import { PasswordField } from "./password-field";

const initialState: AuthFormState = {};

export function SignInForm() {
  const [state, action, pending] = useActionState(signIn, initialState);

  return (
    <div className="auth-form-wrap">
      <div className="auth-form-heading">
        <p>Welcome back</p>
        <h2>Sign in to your workspace</h2>
        <span>Use the credentials issued by your HRBP administrator.</span>
      </div>
      <form action={action} className="auth-form">
        <label className="auth-field" htmlFor="sign-in-email">
          <span>Email address</span>
          <input
            aria-describedby={state.errors?.email ? "sign-in-email-error" : undefined}
            aria-invalid={Boolean(state.errors?.email)}
            autoComplete="email"
            id="sign-in-email"
            maxLength={320}
            name="email"
            placeholder="name@company.com"
            required
            type="email"
          />
          {state.errors?.email ? <small className="auth-field-error" id="sign-in-email-error">{state.errors.email[0]}</small> : null}
        </label>
        <PasswordField
          autoComplete="current-password"
          error={state.errors?.password}
          id="sign-in-password"
          label="Password"
          name="password"
        />
        {state.message ? <p className="auth-form-message error" role="alert">{state.message}</p> : null}
        <button className="auth-submit" disabled={pending} type="submit">
          <span>{pending ? "Signing in…" : "Sign in"}</span>
          <ArrowRight aria-hidden="true" size={18} />
        </button>
      </form>
      <p className="auth-support-copy">Need access? <Link href="/sign-up">Create an account</Link></p>
    </div>
  );
}
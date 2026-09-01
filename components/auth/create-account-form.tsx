"use client";

import { UserPlus } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";

import { createUserAccount } from "@/app/actions/auth";
import type { AuthFormState } from "@/lib/auth/types";

import { PasswordField } from "./password-field";

const initialState: AuthFormState = {};

export function CreateAccountForm() {
  const [state, action, pending] = useActionState(createUserAccount, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <section className="account-form-panel">
      <form action={action} className="auth-form account-create-form" ref={formRef}>
        <label className="auth-field" htmlFor="account-name">
          <span>Full name</span>
          <input autoComplete="name" id="account-name" maxLength={150} name="name" required />
          {state.errors?.name ? <small className="auth-field-error">{state.errors.name[0]}</small> : null}
        </label>
        <label className="auth-field" htmlFor="account-email">
          <span>Email address</span>
          <input autoComplete="email" id="account-email" maxLength={320} name="email" required type="email" />
          {state.errors?.email ? <small className="auth-field-error">{state.errors.email[0]}</small> : null}
        </label>
        <label className="auth-field" htmlFor="account-hrbp-id">
          <span>HRBP ID</span>
          <input id="account-hrbp-id" min="1" name="hrbpId" required type="number" />
          {state.errors?.hrbpId ? <small className="auth-field-error">{state.errors.hrbpId[0]}</small> : null}
        </label>
        <PasswordField
          autoComplete="new-password"
          error={state.errors?.password}
          id="account-password"
          label="Password"
          name="password"
        />
        <PasswordField
          autoComplete="new-password"
          error={state.errors?.confirmPassword}
          id="account-confirm-password"
          label="Confirm password"
          name="confirmPassword"
        />
        {state.message ? (
          <p className={`auth-form-message ${state.success ? "success" : "error"}`} role="status">
            {state.message}
          </p>
        ) : null}
        <button className="auth-submit account-submit" disabled={pending} type="submit">
          <UserPlus aria-hidden="true" size={18} />
          <span>{pending ? "Creating account…" : "Create account"}</span>
        </button>
      </form>
    </section>
  );
}
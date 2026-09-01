"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function PasswordField({
  id,
  label,
  name,
  autoComplete,
  error,
}: {
  id: string;
  label: string;
  name: string;
  autoComplete: string;
  error?: string[];
}) {
  const [visible, setVisible] = useState(false);
  const errorId = error ? `${id}-error` : undefined;

  return (
    <label className="auth-field" htmlFor={id}>
      <span>{label}</span>
      <span className="auth-password-control">
        <input
          aria-describedby={errorId}
          aria-invalid={Boolean(error)}
          autoComplete={autoComplete}
          id={id}
          maxLength={128}
          name={name}
          required
          type={visible ? "text" : "password"}
        />
        <button
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          onClick={() => setVisible((value) => !value)}
          title={visible ? "Hide password" : "Show password"}
          type="button"
        >
          {visible ? <EyeOff aria-hidden="true" size={17} /> : <Eye aria-hidden="true" size={17} />}
        </button>
      </span>
      {error ? <small className="auth-field-error" id={errorId}>{error[0]}</small> : null}
    </label>
  );
}
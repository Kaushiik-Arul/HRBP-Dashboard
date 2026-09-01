import { CreateAccountForm } from "@/components/auth/create-account-form";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <main className="auth-page">
      <section className="auth-brand-panel" aria-label="HRBP Dashboard">
        <div className="auth-brand-lockup">
          <span className="brand-mark">PS</span>
          <span><strong>HRBP</strong> Dashboard</span>
        </div>
        <div className="auth-brand-copy">
          <p>Internal workforce workspace</p>
          <h1>Create your secure dashboard access.</h1>
          <span>Register with your assigned HRBP ID to access workforce insights.</span>
        </div>
      </section>
      <section className="auth-form-panel auth-registration-panel">
        <div className="auth-registration-wrap">
          <div className="auth-form-heading">
            <p>New account</p>
            <h2>Sign up for the dashboard</h2>
            <span>Enter your internal HRBP details to create an account.</span>
          </div>
          <CreateAccountForm />
          <p className="auth-switch-copy">Already registered? <Link href="/sign-in">Sign in</Link></p>
        </div>
      </section>
    </main>
  );
}
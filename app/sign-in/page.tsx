import { redirect } from "next/navigation";

import { SignInForm } from "@/components/auth/sign-in-form";
import { currentUser } from "@/lib/auth/dal";

export default async function SignInPage() {
  if (await currentUser()) redirect("/");

  return (
    <main className="auth-page">
      <section className="auth-brand-panel" aria-label="HRBP Dashboard">
        <div className="auth-brand-lockup">
          <span className="brand-mark">PS</span>
          <span><strong>HRBP</strong> Dashboard</span>
        </div>
        <div className="auth-brand-copy">
          <p>Workforce intelligence</p>
          <h1>People insights, held in one clear view.</h1>
          <span>Secure access for your HR business partnership team.</span>
        </div>
      </section>
      <section className="auth-form-panel">
        <SignInForm />
      </section>
    </main>
  );
}
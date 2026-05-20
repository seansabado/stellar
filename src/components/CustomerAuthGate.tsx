"use client";

import { type ReactNode, useState } from "react";
import { useCustomerAuth } from "../lib/customerAuth";

export default function CustomerAuthGate({ children }: { children: ReactNode }) {
  const { loading, session, signInWithGooglePopup } = useCustomerAuth();
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const mapAuthError = (authError: unknown) => {
    const code =
      authError && typeof authError === "object" && "code" in authError
        ? String((authError as { code?: string }).code)
        : "";

    switch (code) {
      case "auth/popup-closed-by-user":
      case "auth/cancelled-popup-request":
        return { message: null, code };
      case "auth/unauthorized-domain":
        return {
          message:
            "Google sign-in is not authorized for this domain yet. Please contact support to allow this URL in Firebase Authentication.",
          code,
        };
      case "auth/operation-not-allowed":
        return {
          message: "Google sign-in is not enabled right now. Please try again shortly.",
          code,
        };
      default:
        return {
          message: "Unable to sign in with Google right now. Please try again.",
          code,
        };
    }
  };

  const handleSignInClick = async () => {
    setSigningIn(true);
    setError(null);
    try {
      await signInWithGooglePopup();
    } catch (authError) {
      const mapped = mapAuthError(authError);
      if (!mapped.message) {
        return;
      }
      setError(mapped.message);
    } finally {
      setSigningIn(false);
    }
  };

  if (loading) {
    return (
      <main className="container auth-gate-shell">
        <section className="auth-card">
          <p className="eyebrow">Secure Sign-In</p>
          <h1>Preparing your account</h1>
          <p className="subcopy">Verifying your session securely.</p>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="container auth-gate-shell">
        <section className="auth-card">
          <p className="eyebrow">Welcome to LaundromatAI</p>
          <h1>Sign in with Google</h1>
          <p className="subcopy">
            Access your orders, payments, and receipts in one secure workspace.
          </p>
          {error ? <p className="pay-error">{error}</p> : null}
          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => void handleSignInClick()}
              disabled={signingIn}
            >
              {signingIn ? "Opening Google Sign-In..." : "Sign in with Google"}
            </button>
            {signingIn ? <p className="google-identity-status">Completing Google sign-in...</p> : null}
          </div>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}

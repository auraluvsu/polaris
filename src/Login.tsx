import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-content">
          <div className="login-header">
            <div className="polaris-logo-large">
              <svg aria-hidden="true" width="56" height="56" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="11" fill="#D5AA4F" />
                <path d="M20 4.5 23.2 16.8 20 20l-3.2-3.2L20 4.5Z" fill="#143F36" />
                <path d="m35.5 20-12.3 3.2L20 20l3.2-3.2L35.5 20ZM20 35.5l-3.2-12.3L20 20l3.2 3.2L20 35.5ZM4.5 20l12.3-3.2L20 20l-3.2 3.2L4.5 20Z" fill="#FFF9E9" />
                <path d="m20 15.4 4.6 4.6-4.6 4.6-4.6-4.6 4.6-4.6Z" fill="#3B2D21" />
              </svg>
            </div>
            <h1>Polaris</h1>
            <p className="tagline">Your local sales desk, all in one place</p>
          </div>

          <div className="login-form">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="btn-google"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {loading ? "Signing in..." : "Sign in with Google"}
            </button>
            {error && <div className="error-message">{error}</div>}
          </div>

          <div className="login-footer">
            <p>Track every conversation from research to payment, all in one platform.</p>
            <div className="features">
              <div className="feature">
                <span className="feature-icon">✓</span>
                <span>Manage prospects</span>
              </div>
              <div className="feature">
                <span className="feature-icon">✓</span>
                <span>Track calls & follow-ups</span>
              </div>
              <div className="feature">
                <span className="feature-icon">✓</span>
                <span>Monitor sales pipeline</span>
              </div>
            </div>
          </div>
        </div>

        <div className="login-decoration">
          <div className="deco-circle" />
        </div>
      </div>
    </div>
  );
}

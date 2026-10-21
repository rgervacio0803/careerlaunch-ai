import { useState } from "react";
import { supabase } from "../supabaseClient";
import "./Auth.css";

// Supabase's messages, reworded for people who aren't developers.
function friendlyError(error) {
  const message = error?.message || "";

  if (/invalid login credentials/i.test(message)) {
    return "That email and password don't match. Check them and try again, or create an account.";
  }

  if (/email not confirmed/i.test(message)) {
    return "Please confirm your email first. Check your inbox (and spam folder) for the link we sent.";
  }

  if (/rate limit|too many/i.test(message)) {
    return "Too many attempts. Please wait a minute and try again.";
  }

  return message || "Something went wrong. Please try again.";
}

export default function Auth({ onBack }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isSignUp = mode === "signup";

  function switchMode(nextMode) {
    setMode(nextMode);
    setMessage("");
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      if (isSignUp) {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        // Supabase doesn't reveal existing emails as an error; an existing
        // account comes back with no identities instead.
        if (data.user && data.user.identities?.length === 0) {
          setMode("login");
          setError(
            "An account with this email already exists. Log in with your password instead.",
          );
          return;
        }

        if (data.session) {
          return; // Email confirmation is off: already logged in.
        }

        setMessage(
          "Almost done! Check your email and click the confirmation link, then come back and log in.",
        );
        setMode("login");
        setPassword("");
        return;
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        {onBack && (
          <button type="button" className="back-home-btn" onClick={onBack}>
            ← Back to Home
          </button>
        )}

        <div className="auth-tabs" role="tablist" aria-label="Log in or sign up">
          <button
            type="button"
            role="tab"
            aria-selected={!isSignUp}
            className={!isSignUp ? "active" : ""}
            onClick={() => switchMode("login")}
          >
            Log In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isSignUp}
            className={isSignUp ? "active" : ""}
            onClick={() => switchMode("signup")}
          >
            Create Account
          </button>
        </div>

        <h2>{isSignUp ? "Create Your Free Account" : "Welcome Back"}</h2>

        <p>
          {isSignUp
            ? "Get started with your free ATS resume analysis."
            : "Log in to continue with CareerLaunch AI."}
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="auth-email">Email address</label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            placeholder={isSignUp ? "At least 12 characters" : "Your password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={isSignUp ? 12 : undefined}
            required
          />

          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isSignUp
                ? "Create Free Account"
                : "Log In"}
          </button>
        </form>

        {message && (
          <p className="auth-message" role="status">
            {message}
          </p>
        )}
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

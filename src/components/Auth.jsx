
import { useState } from "react";
import { supabase } from "../supabaseClient";
import "./Auth.css";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const { error: authError } = isSignUp
        ? await supabase.auth.signUp({
            email,
            password,
          })
        : await supabase.auth.signInWithPassword({
            email,
            password,
          });

      if (authError) throw authError;

      if (isSignUp) {
        setMessage("Check your email to confirm your account.");
      }
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isSignUp ? "Create Your Free Account" : "Welcome Back"}</h2>

        <p>
          {isSignUp
            ? "Get started with your free ATS resume analysis."
            : "Log in to continue with CareerLaunch AI."}
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password (minimum 12 characters)"
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

        {message && <p role="status">{message}</p>}
        {error && <p role="alert">{error}</p>}

        <p>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage("");
              setError("");
            }}
          >
            {isSignUp ? "Log In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}

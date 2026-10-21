import { useState } from "react";
import { supabase } from "../supabaseClient";
import "./Auth.css";

// Shown after someone opens the reset link from their email. The link signs
// them in, so here they only choose a new password.
export default function ResetPassword({ user, onDone, onCancel }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (updateError) {
      setError(
        /different from the old/i.test(updateError.message)
          ? "Please choose a password you haven't used before."
          : updateError.message || "Unable to update your password.",
      );
      return;
    }

    onDone();
  }

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Link Expired</h2>
          <p>
            This reset link has expired or was already used. Request a new one
            from the log in screen.
          </p>
          <button type="button" className="auth-primary" onClick={onCancel}>
            Back to Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Choose a New Password</h2>
        <p>For {user.email}</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="new-password">New password</label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 12 characters"
            minLength={12}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label htmlFor="confirm-password">Confirm new password</label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            minLength={12}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save New Password"}
          </button>
        </form>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

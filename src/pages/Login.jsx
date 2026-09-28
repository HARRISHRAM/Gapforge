import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../App";

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Please fill in both email and password.");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Animated background blobs */}
      <div className="auth-bg">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
        <div className="auth-blob auth-blob-3" />
      </div>

      {/* Logo / Brand */}
      <div className="auth-brand">
        <Link to="/" className="auth-logo">
          Gap<span>Forge</span>
        </Link>
      </div>

      {/* Card */}
      <div className="auth-card-wrap">
        <div className="auth-card">
          {/* Header */}
          <div className="auth-card-header">
            <div className="auth-icon">🔒</div>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to continue your learning journey</p>
          </div>

          {/* Error */}
          {error && (
            <div className="auth-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="login-email" className="auth-label">Email Address</label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="auth-input"
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="login-password" className="auth-label">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="auth-show-toggle"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="auth-input auth-input-mono"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-submit-btn"
            >
              {loading ? (
                <>
                  <span className="auth-spinner" />
                  Signing in…
                </>
              ) : (
                "Sign in →"
              )}
            </button>
          </form>

          {/* Footer link */}
          <div className="auth-card-footer">
            Don't have an account?{" "}
            <Link to="/register" className="auth-switch-link">
              Create one free
            </Link>
          </div>
        </div>

        {/* Side panel */}
        <div className="auth-side">
          <div className="auth-side-content">
            <div className="auth-side-tag">Adaptive Learning</div>
            <h2 className="auth-side-title">Your personalized career roadmap awaits</h2>
            <p className="auth-side-body">
              GapForge identifies your skill gaps, builds a custom learning path, and adapts as you grow — all powered by AI.
            </p>
            <ul className="auth-features">
              <li><span className="auth-feature-dot" />AI-powered skill gap analysis</li>
              <li><span className="auth-feature-dot" />Personalized learning roadmap</li>
              <li><span className="auth-feature-dot" />Real-world projects & quizzes</li>
              <li><span className="auth-feature-dot" />Career readiness tracking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

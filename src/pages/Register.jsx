import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { careers } from "../data/careers";
import { useApp } from "../App";

export default function Register() {
  const { register } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [career, setCareer] = useState("fullstack");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password, career });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to create account.");
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
        {/* Side panel — flipped to left on register */}
        <div className="auth-side auth-side-left">
          <div className="auth-side-content">
            <div className="auth-side-tag">Get Started Free</div>
            <h2 className="auth-side-title">Join thousands of learners building their careers</h2>
            <p className="auth-side-body">
              Create your free account and get a personalized skill assessment in minutes. No credit card required.
            </p>
            <ul className="auth-features">
              <li><span className="auth-feature-dot" />Free forever for core features</li>
              <li><span className="auth-feature-dot" />Instant skill gap assessment</li>
              <li><span className="auth-feature-dot" />Custom roadmap in seconds</li>
              <li><span className="auth-feature-dot" />Adaptive learning paths</li>
            </ul>
          </div>
        </div>

        <div className="auth-card">
          {/* Header */}
          <div className="auth-card-header">
            <div className="auth-icon">✨</div>
            <h1 className="auth-title">Create your account</h1>
            <p className="auth-subtitle">Start your personalized learning journey today</p>
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
              <label htmlFor="reg-name" className="auth-label">Full Name</label>
              <input
                id="reg-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="auth-input"
                autoComplete="name"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="reg-email" className="auth-label">Email Address</label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="auth-input"
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="reg-password" className="auth-label">Password</label>
              <input
                id="reg-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="auth-input auth-input-mono"
                autoComplete="new-password"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="reg-career" className="auth-label">Target Career Path</label>
              <select
                id="reg-career"
                value={career}
                onChange={(e) => setCareer(e.target.value)}
                className="auth-input auth-select"
              >
                {careers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-submit-btn"
            >
              {loading ? (
                <>
                  <span className="auth-spinner" />
                  Creating account…
                </>
              ) : (
                "Create account →"
              )}
            </button>
          </form>

          {/* Footer link */}
          <div className="auth-card-footer">
            Already have an account?{" "}
            <Link to="/login" className="auth-switch-link">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// src/components/submission/AuthGate.jsx
import { useState }          from "react";
import { Link }              from "react-router-dom";
import { BYPASS_DATE_CHECK } from "../../config/dates";
import { verifyTeam }        from "../../lib/teamAuth";
import "./Authgate.css";

export default function AuthGate({ onAuthenticated, stage }) {
  const [regNumber, setRegNumber] = useState("");
  const [email,     setEmail]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!regNumber.trim() || !email.trim()) {
      setError("Please fill in both fields.");
      return;
    }
    setLoading(true);
    try {
      const team = await verifyTeam(regNumber, email);
      onAuthenticated(team);
    } catch (err) {
      setError(err.message || "Verification failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  }

  function skipLogin() {
    onAuthenticated({
      id: "test-bypass", team_name: "Test Team Alpha",
      registration_number: "DX2026-TEST", email: "test@example.com",
      university: "Test University", member_count: 3,
      stage1_eligible: true, stage3_eligible: false,
    });
  }

  return (
    <div className="auth-gate">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-eyebrow">DataXplore 2.0 — Stage {stage}</span>
          <h1 className="auth-title">Team Verification</h1>
          <p className="auth-subtitle">
            Enter your registration details to access the submission portal.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-field">
            <label htmlFor="reg-number">Registration Number</label>
            <input
              id="reg-number" type="text" placeholder="e.g. DX2026-001"
              value={regNumber} onChange={e => setRegNumber(e.target.value)}
              autoComplete="off" spellCheck={false} disabled={loading}
            />
          </div>
          <div className="auth-field">
            <label htmlFor="team-email">Team Email Address</label>
            <input
              id="team-email" type="email" placeholder="team@university.ac.lk"
              value={email} onChange={e => setEmail(e.target.value)}
              autoComplete="email" disabled={loading}
            />
          </div>
          {error && <div className="auth-error" role="alert">⚠ {error}</div>}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? <span className="auth-spinner">Verifying<span className="dots" /></span>
              : "Verify & Continue →"}
          </button>
        </form>

        {BYPASS_DATE_CHECK && (
          <div className="auth-bypass">
            <span className="auth-bypass__label">🛠 Testing Mode</span>
            <button onClick={skipLogin} className="auth-bypass__btn">
              Skip Login (use mock data)
            </button>
          </div>
        )}
        <Link to="/" className="auth-back">← Back to Home</Link>
      </div>
    </div>
  );
}
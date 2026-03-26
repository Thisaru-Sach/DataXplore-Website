// src/components/submission/AuthGate.jsx
// ─────────────────────────────────────────────────────────
//  Shown on /submit before the upload portal.
//  Asks for:  Registration Number  +  Team Email
//
//  In testing mode (BYPASS_DATE_CHECK = true) a "Skip Login"
//  button lets you go straight to the portal with mock data.
//
//  When Supabase is added later, replace the TODO block with
//  a real DB lookup.
// ─────────────────────────────────────────────────────────
import { useState }               from "react";
import { Link }                   from "react-router-dom";
import { BYPASS_DATE_CHECK }      from "../../config/dates";
import "./AuthGate.css";

export default function AuthGate({ onAuthenticated, stage }) {
  const [regNumber, setRegNumber] = useState("");
  const [email,     setEmail]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  // ── Handle submit ──────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!regNumber.trim() || !email.trim()) {
      setError("Please fill in both fields.");
      return;
    }

    setLoading(true);

    try {
      // ─────────────────────────────────────────────────
      //  TODO: replace this block with a real Supabase
      //  lookup once the database is set up:
      //
      //  const { data, error } = await supabase
      //    .from("teams")
      //    .select("*")
      //    .eq("registration_number", regNumber.trim())
      //    .eq("email", email.trim().toLowerCase())
      //    .single();
      //
      //  if (error || !data) throw new Error("Team not found");
      //  onAuthenticated(data);
      // ─────────────────────────────────────────────────

      // MOCK verification for testing — accepts any non-empty input
      await delay(800); // simulate network

      const mockTeam = {
        id:                  "mock-team-id-001",
        team_name:           "Team " + regNumber.trim().toUpperCase(),
        registration_number: regNumber.trim().toUpperCase(),
        email:               email.trim().toLowerCase(),
        university:          "University of Sri Jayewardenepura",
        member_count:        4,
      };

      onAuthenticated(mockTeam);

    } catch (err) {
      setError(err.message || "Verification failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  }

  // ── Skip login (testing only) ──────────────────────────
  function skipLogin() {
    onAuthenticated({
      id:                  "test-team-bypass",
      team_name:           "Test Team Alpha",
      registration_number: "DX2026-TEST",
      email:               "test@example.com",
      university:          "Test University",
      member_count:        3,
    });
  }

  return (
    <div className="auth-gate">
      <div className="auth-card">

        {/* Header */}
        <div className="auth-header">
          <span className="auth-eyebrow">DataXplore 2.0 — Stage {stage}</span>
          <h1 className="auth-title">Team Verification</h1>
          <p className="auth-subtitle">
            Enter your registration details to access the submission portal.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>

          <div className="auth-field">
            <label htmlFor="reg-number">Registration Number</label>
            <input
              id="reg-number"
              type="text"
              placeholder="e.g. DX2026-001"
              value={regNumber}
              onChange={e => setRegNumber(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              disabled={loading}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="team-email">Team Email Address</label>
            <input
              id="team-email"
              type="email"
              placeholder="team@university.ac.lk"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="auth-error" role="alert">
              ⚠ {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? (
              <span className="auth-spinner">Verifying<span className="dots" /></span>
            ) : (
              "Verify & Continue →"
            )}
          </button>

        </form>

        {/* Testing bypass */}
        {BYPASS_DATE_CHECK && (
          <div className="auth-bypass">
            <span className="auth-bypass__label">🛠 Testing Mode</span>
            <button onClick={skipLogin} className="auth-bypass__btn">
              Skip Login (use mock data)
            </button>
          </div>
        )}

        {/* Back link */}
        <Link to="/" className="auth-back">← Back to Home</Link>

      </div>
    </div>
  );
}

// Simple delay helper
function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}
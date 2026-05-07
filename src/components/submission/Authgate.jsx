// src/components/submission/Authgate.jsx
import { useState }          from "react";
import { Link }              from "react-router-dom";
import { BYPASS_DATE_CHECK, DATES, fmt } from "../../config/dates";
import { verifyTeam }        from "../../lib/teamAuth";
import "./Authgate.css";

// ✅ Set your Google Drive folder links here
const STAGE1_DATASET_DRIVE_URL = "https://drive.google.com/drive/folders/14Z7UFQ438PP6i7y4w9vXtF83F7NQxSnH?usp=sharing";
const STAGE3_DATASET_DRIVE_URL = "https://drive.google.com/drive/folders/14Z7UFQ438PP6i7y4w9vXtF83F7NQxSnH?usp=sharing";

export default function AuthGate({ onAuthenticated, stage }) {
  const [nic,     setNic]     = useState("");
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  // Stage 3 dataset link is only shown when stage 3 is actually open
  const now = new Date();
  const stage3DatasetVisible =
    BYPASS_DATE_CHECK ||
    (stage === 3 && now >= DATES.stage3Open);

  // Which drive URL to show
  const driveUrl  = stage === 3 ? STAGE3_DATASET_DRIVE_URL : STAGE1_DATASET_DRIVE_URL;
  const showDrive = stage === 1 || stage3DatasetVisible;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!nic.trim() || !email.trim()) {
      setError("Please fill in both fields.");
      return;
    }

    setLoading(true);
    try {
      const team = await verifyTeam(nic, email);

      // ── Stage 3 eligibility check ─────────────────────
      // Even if the team authenticated, they must be stage3_eligible
      // to access the Stage 3 portal. Show a clear error if not.
      if (stage === 3 && !team.stage3_eligible) {
        setError(
          "Your team is not eligible for Stage 3. " +
          "Only the Top 10 teams from Stage 1 can submit for Stage 3."
        );
        setLoading(false);
        return;
      }

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
      nic_number: "TEST", email: "test@example.com",
      university: "Test University", member_count: 3,
      stage1_eligible: true, stage3_eligible: true,
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
          {/* Stage 3 eligibility reminder */}
          {stage === 3 && (
            <p className="auth-stage3-note">
              🏆 Stage 3 is open to <strong>Top 10 teams only</strong>.
              Your team must have been selected after Stage 1.
            </p>
          )}
        </div>

        {/* Dataset Drive link */}
        {showDrive && (
          <div className={`auth-dataset-box ${stage === 3 ? "auth-dataset-box--stage3" : ""}`}>
            <div className="auth-dataset-icon">📁</div>
            <div className="auth-dataset-text">
              <span className="auth-dataset-label">
                {stage === 3 ? "Stage 3 Competition Dataset" : "Competition Dataset"}
              </span>
              <p className="auth-dataset-desc">
                {stage === 3
                  ? `Download the Stage 3 dataset from Google Drive. Available from ${fmt(DATES.stage3Open, "datetime")}.`
                  : "Download the official dataset for Stage 1 from Google Drive."}
              </p>
            </div>
            <a
              href={driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="auth-dataset-btn"
            >
              Open Drive →
            </a>
          </div>
        )}

        {/* Stage 3 dataset not yet available notice */}
        {stage === 3 && !stage3DatasetVisible && (
          <div className="auth-dataset-pending">
            <span>📁</span>
            <div>
              <span className="auth-dataset-label">Stage 3 Dataset</span>
              <p className="auth-dataset-desc">
                The Stage 3 dataset will be available from{" "}
                <strong>{fmt(DATES.stage3Open, "datetime")}</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-field">
            <label htmlFor="nic">Team Leader's NIC Number</label>
            <input
              id="nic" type="text" placeholder="e.g. 200XXXXXXXXX"
              value={nic} onChange={e => setNic(e.target.value)}
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
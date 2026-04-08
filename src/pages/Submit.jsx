// src/pages/Submit.jsx
// ─────────────────────────────────────────────────────────
//  The /submit route.
//  Flow:
//    1. Check if submission is currently open (or bypass in testing)
//    2. If closed → show a "closed" screen
//    3. If open  → show AuthGate
//    4. Once authenticated → show SubmissionPortal
// ─────────────────────────────────────────────────────────
import { useState }        from "react";
import { Link }            from "react-router-dom";
import { getPhase, BYPASS_DATE_CHECK, DATES } from "../config/dates.js";
import AuthGate            from "../components/submission/AuthGate.jsx";
import SubmissionPortal    from "../components/submission/SubmissionPortal.jsx";
import Canvas              from "../components/Canvas.jsx";
import "./Submit.css";

export default function Submit() {
  // team is set by AuthGate once the user is verified
  const [team, setTeam] = useState(null);

  const phase = getPhase();

  // Determine whether the submission portal should be accessible
  const portalOpen =
    BYPASS_DATE_CHECK ||
    phase === "stage1_open" ||
    phase === "stage3_open";

  // Which stage number is currently active (used inside portal)
  const activeStage =
    phase === "stage3_open" ? 3 : 1;

  // ── Portal is closed ──────────────────────────────────
  if (!portalOpen) {
    return (
      <>
        <Canvas />
        <div className="submit-page">
          <ClosedScreen phase={phase} />
        </div>
      </>
    );
  }

  // ── Portal open but team not yet authenticated ─────────
  if (!team) {
    return (
      <>
        <Canvas />
        <div className="submit-page">
          <AuthGate onAuthenticated={setTeam} stage={activeStage} />
        </div>
      </>
    );
  }

  // ── Authenticated — show upload portal ────────────────
  return (
    <>
      <Canvas />
      <div className="submit-page">
        <SubmissionPortal team={team} stage={activeStage} />
      </div>
    </>
  );
}

// ── Closed screen component ────────────────────────────────
function ClosedScreen({ phase }) {
  const messages = {
    before_reg: {
      icon:    "🔒",
      title:   "Registration Not Yet Open",
      body:    `Registration opens on ${DATES.registrationOpen.toDateString()}.`,
      sub:     "Check back soon!",
    },
    reg_open: {
      icon:    "📝",
      title:   "Registration Is Open",
      body:    "The file submission portal is not yet open. Please register your team first.",
      sub:     `Registration closes on ${DATES.registrationClose.toDateString()}.`,
      cta:     { label: "Register Now", href: "https://tally.so/r/Np0kpG" },
    },
    reg_closed: {
      icon:    "⏳",
      title:   "Registration Closed",
      body:    "Thank you for registering! The Stage 1 submission portal will open soon.",
      sub:     `Stage 1 submissions open on ${DATES.stage1Open.toDateString()}.`,
    },
    stage1_closed: {
      icon:    "✅",
      title:   "Stage 1 Submissions Closed",
      body:    "Stage 1 submissions have ended. The Top 10 teams will be announced shortly.",
      sub:     `Top 10 announcement: ${DATES.top10Announce.toDateString()}.`,
    },
    stage3_closed: {
      icon:    "🏁",
      title:   "All Submissions Closed",
      body:    "The submission portal has closed. Thank you to all participating teams!",
      sub:     `Winners will be announced on ${DATES.winnersAnnounce.toDateString()}.`,
    },
  };

  const m = messages[phase] || {
    icon: "🔒", title: "Portal Unavailable", body: "Please check back later.", sub: "",
  };

  return (
    <div className="closed-screen">
      <div className="closed-card">
        <div className="closed-icon">{m.icon}</div>
        <h1 className="closed-title">{m.title}</h1>
        <p className="closed-body">{m.body}</p>
        {m.sub && <p className="closed-sub">{m.sub}</p>}

        {m.cta && (
          <a href={m.cta.href} target="_blank" rel="noreferrer" className="btn-primary-sub">
            {m.cta.label}
          </a>
        )}

        <Link to="/" className="btn-outline-sub">← Back to Home</Link>
      </div>
    </div>
  );
}
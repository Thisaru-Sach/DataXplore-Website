// src/components/submission/SubmissionBanner.jsx
// ─────────────────────────────────────────────────────────
//  Shown on the Home page between Hero and About.
//  Reads the current phase and renders the appropriate
//  status message + CTA button.
// ─────────────────────────────────────────────────────────
import { Link } from "react-router-dom";
import { getPhase, BYPASS_DATE_CHECK, DATES } from "../../config/dates";
import "./SubmissionBanner.css";

export default function SubmissionBanner() {
  const phase = getPhase();

  // Config for each phase
  const config = {
    bypass: {
      type:  "info",
      icon:  "🛠️",
      label: "TESTING MODE",
      text:  "Date checks are bypassed. All portals are accessible.",
      cta:   { label: "Open Submission Portal", to: "/submit" },
    },
    before_reg: {
      type:  "waiting",
      icon:  "📅",
      label: "COMING SOON",
      text:  `Registration opens on ${fmt(DATES.registrationOpen)}.`,
      cta:   null,
    },
    reg_open: {
      type:  "open",
      icon:  "📝",
      label: "REGISTRATION OPEN",
      text:  `Register your team before ${fmt(DATES.registrationClose)}.`,
      cta:   { label: "Register Now →", href: "https://tally.so/r/Np0kpG" },
    },
    reg_closed: {
      type:  "waiting",
      icon:  "⏳",
      label: "REGISTRATION CLOSED",
      text:  `Stage 1 submissions open on ${fmt(DATES.stage1Open)}.`,
      cta:   null,
    },
    stage1_open: {
      type:  "open",
      icon:  "🚀",
      label: "STAGE 1 SUBMISSION OPEN",
      text:  `Submit your EDA report before ${fmt(DATES.stage1Close)}.`,
      cta:   { label: "Upload Files →", to: "/submit" },
    },
    stage1_closed: {
      type:  "closed",
      icon:  "✅",
      label: "STAGE 1 SUBMISSIONS CLOSED",
      text:  `Top 10 teams will be announced on ${fmt(DATES.top10Announce)}.`,
      cta:   null,
    },
    stage3_open: {
      type:  "open",
      icon:  "🏆",
      label: "STAGE 3 SUBMISSION OPEN",
      text:  `Submit your final report and dashboard before ${fmt(DATES.stage3Close)}.`,
      cta:   { label: "Upload Files →", to: "/submit" },
    },
    stage3_closed: {
      type:  "closed",
      icon:  "🏁",
      label: "ALL SUBMISSIONS CLOSED",
      text:  `Winners will be announced on ${fmt(DATES.winnersAnnounce)}.`,
      cta:   null,
    },
  };

  const c = config[phase];
  if (!c) return null;

  return (
    <div className={`sub-banner sub-banner--${c.type}`}>
      <div className="sub-banner__inner">
        <div className="sub-banner__left">
          <span className="sub-banner__icon">{c.icon}</span>
          <div>
            <span className="sub-banner__label">{c.label}</span>
            <p className="sub-banner__text">{c.text}</p>
          </div>
        </div>

        {c.cta && (
          <div className="sub-banner__right">
            {c.cta.to ? (
              /* Internal React Router link */
              <Link to={c.cta.to} className="sub-banner__btn">
                {c.cta.label}
              </Link>
            ) : (
              /* External link (registration form) */
              <a href={c.cta.href} target="_blank" rel="noreferrer" className="sub-banner__btn">
                {c.cta.label}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Format date nicely: "28 Mar 2026"
function fmt(date) {
  return date.toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}
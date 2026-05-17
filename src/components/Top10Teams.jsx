// src/components/Top10Teams.jsx
// ─────────────────────────────────────────────────────────
//  Three reveal phases, each unlocking on a different date:
//
//  Phase 1 — from top10Announce:
//    Shows all stage3_eligible teams → "Top 10 Selected Teams"
//
//  Phase 2 — from top5Announce:
//    top5_eligible teams get a "🏆 Top 5 Finalist" highlight.
//    Others remain listed as Stage 3 participants.
//
//  Phase 3 — from presentations:
//    presentation_eligible teams get a "🎤 Presenter" badge.
//    The section title updates to "Final Presentations".
//
//  Section is completely hidden before top10Announce.
// ─────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { supabase }            from "../lib/supabase";
import { DATES, BYPASS_DATE_CHECK, fmt } from "../config/dates";
import "./Top10Teams.css";

export default function Top10Teams() {
  const [teams,   setTeams]   = useState([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();

  // ── Which phase are we in? ─────────────────────────────
  const showSection      = BYPASS_DATE_CHECK || now >= DATES.top10Announce;
  const showTop5         = BYPASS_DATE_CHECK || now >= DATES.top5Announce;
  const showPresentations = BYPASS_DATE_CHECK || now >= DATES.presentations;

  useEffect(() => {
    if (!showSection) { setLoading(false); return; }

    async function fetchTeams() {
      // Fetch all columns needed for all three phases in one query
      const { data, error } = await supabase
        .from("teams")
        .select("id, team_name, university, stage3_eligible, top5_eligible, presentation_eligible")
        .eq("stage3_eligible", true)
        .order("team_name", { ascending: true });

      if (!error && data) setTeams(data);
      setLoading(false);
    }

    fetchTeams();
  }, [showSection]);

  // Hidden entirely before top10Announce
  if (!showSection) return null;

  // ── Dynamic section title and intro ───────────────────
  let sectionEyebrow = "Dashboard Competition";
  let sectionTitle   = <h2 className="sec-title">Top 10 <span>Selected Teams</span></h2>;
  let sectionIntro   = "Congratulations to the following teams who have been selected to advance to the Dashboard Competition (Stage 3).";

  if (showPresentations) {
    sectionEyebrow = "Top 3 Finalists";
    sectionTitle   = <h2 className="sec-title">Top 3 <span>Finalists</span></h2>;
    sectionIntro   = "The Top 3 teams have been selected from the presentations. Congratulations!";
  } else if (showTop5) {
    sectionEyebrow = "Top 5 Finalists";
    sectionTitle   = <h2 className="sec-title">Top 5 <span>Finalists</span></h2>;
    sectionIntro   = "The Top 5 teams have been selected from the Dashboard Competition. Congratulations!";
  }

  // ── Badge helper ───────────────────────────────────────
  function getBadge(team) {
    if (showPresentations && team.presentation_eligible) {
      return <span className="top10-badge top10-badge--presenter">🎤 Presenter</span>;
    }
    if (showTop5 && team.top5_eligible) {
      return <span className="top10-badge top10-badge--top5">🏆 Top 5 Finalist</span>;
    }
    // Phase 1 default or teams not in top5
    if (!showTop5 || team.stage3_eligible) {
      return <span className="top10-badge top10-badge--advanced">✓ Advanced</span>;
    }
    return null;
  }

  // ── Which teams to show in each phase ─────────────────
  // Phase 3: only show presentation_eligible teams
  // Phase 2: only show top5_eligible teams
  // Phase 1: show all stage3_eligible teams
  let displayTeams = teams;
  if (showPresentations) {
    displayTeams = teams.filter(t => t.presentation_eligible);
  } else if (showTop5) {
    displayTeams = teams.filter(t => t.top5_eligible);
  }

  // In phase 1, also keep showing all 10 even after top5 is revealed
  // (we show the full 10 with top5 highlighted above others)
  // So for phase 2 we actually want to show ALL top-10 with top5 badges
  if (showTop5 && !showPresentations) {
    displayTeams = [...teams].sort((a, b) => {
      // top5 teams first, then others
      if (a.top5_eligible && !b.top5_eligible) return -1;
      if (!a.top5_eligible && b.top5_eligible) return 1;
      return a.team_name.localeCompare(b.team_name);
    });
  }

  return (
    <>
      <div className="sec-divider" id="sec-top10"></div>
      <div className="sec-wrap reveal">

        <p className="sec-eyebrow">{sectionEyebrow}</p>
        {sectionTitle}
        <p className="top10-intro">{sectionIntro}</p>

        {/* Phase indicator pills */}
        <div className="top10-phases">
          <span className={`top10-phase-pill top10-phase-pill--done`}>
            ✓ Top 10 - {fmt(DATES.top10Announce, "full")}
          </span>
          <span className={`top10-phase-pill ${showTop5 ? "top10-phase-pill--done" : "top10-phase-pill--upcoming"}`}>
            {showTop5 ? "✓" : "⏳"} Top 5 - {fmt(DATES.top5Announce, "full")}
          </span>
          <span className={`top10-phase-pill ${showPresentations ? "top10-phase-pill--done" : "top10-phase-pill--upcoming"}`}>
            {showPresentations ? "✓" : "⏳"} Top 3 - {fmt(DATES.winnersAnnounce, "full")}
          </span>
        </div>

        {loading ? (
          <div className="top10-loading">
            <span className="top10-spinner" />
            Loading teams…
          </div>
        ) : displayTeams.length === 0 ? (
          <p className="top10-empty">
            {showPresentations
              ? "Top 3 teams will be listed here."
              : showTop5
              ? "Top 5 teams will be listed here after the announcement."
              : "Selected teams will be listed here after the announcement."}
          </p>
        ) : (
          <div className="top10-grid">
            {displayTeams.map((t) => (
              <div
                key={t.id}
                className={`top10-card
                  ${showTop5 && t.top5_eligible ? "top10-card--top5" : ""}
                  ${showPresentations && t.presentation_eligible ? "top10-card--presenter" : ""}
                `}
              >
                <div className="top10-info">
                  <span className="top10-name">{t.team_name}</span>
                  <span className="top10-uni">{t.university}</span>
                </div>
                {getBadge(t)}
              </div>
            ))}
          </div>
        )}

        {BYPASS_DATE_CHECK && (
          <div className="top10-bypass-note">
            🛠 Testing Mode active — phases unlock on:
            Top 10: {fmt(DATES.top10Announce)} ·
            Top 5: {fmt(DATES.top5Announce)} ·
            Presentations: {fmt(DATES.presentations)}
          </div>
        )}
      </div>
    </>
  );
}
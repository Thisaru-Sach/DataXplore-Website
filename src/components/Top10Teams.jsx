// src/components/Top10Teams.jsx
// ─────────────────────────────────────────────────────────
//  Shown on the home page from Top 10 announcement day onward.
//  Fetches team names where stage3_eligible = true from Supabase.
//  Hidden completely before the announcement date.
// ─────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { supabase }            from "../lib/supabase";
import { DATES, BYPASS_DATE_CHECK } from "../config/dates";
import "./Top10Teams.css";

export default function Top10Teams() {
  const [teams,   setTeams]   = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Visibility check ──────────────────────────────────
  // Section only appears on/after top10Announce date (or in bypass mode)
  const now     = new Date();
  const visible = BYPASS_DATE_CHECK || now >= DATES.top10Announce;

  useEffect(() => {
    if (!visible) { setLoading(false); return; }

    async function fetchTeams() {
      const { data, error } = await supabase
        .from("teams")
        .select("id, team_name, university")
        .eq("stage3_eligible", true)
        .order("team_name", { ascending: true });

      if (!error && data) setTeams(data);
      setLoading(false);
    }

    fetchTeams();
  }, [visible]);

  // Hidden before announcement date
  if (!visible) return null;

  return (
    <>
      <div className="sec-divider" id="sec-top10"></div>
      <div className="sec-wrap reveal">

        <p className="sec-eyebrow">Dashboard Competition</p>
        <h2 className="sec-title">
          Top 10 <span>Selected Teams</span>
        </h2>
        <p className="top10-intro">
          Congratulations to the following teams who have been selected to advance
          to the Dashboard Competition (Stage 3).
        </p>

        {loading ? (
          <div className="top10-loading">
            <span className="top10-spinner" />
            Loading teams…
          </div>
        ) : teams.length === 0 ? (
          <p className="top10-empty">
            Selected teams will be listed here after the announcement.
          </p>
        ) : (
          <div className="top10-grid">
            {teams.map((t, i) => (
              <div key={t.id} className="top10-card">
                {/* <span className="top10-rank">{String(i + 1).padStart(2, "0")}</span> */}
                <div className="top10-info">
                  <span className="top10-name">{t.team_name}</span>
                  <span className="top10-uni">{t.university}</span>
                </div>
                <span className="top10-badge">✓ Advanced</span>
              </div>
            ))}
          </div>
        )}

        {BYPASS_DATE_CHECK && (
          <p className="top10-bypass-note">
            🛠 Testing Mode — this section is hidden until {DATES.top10Announce.toDateString()}
          </p>
        )}
      </div>
    </>
  );
}
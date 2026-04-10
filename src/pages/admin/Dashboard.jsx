// src/pages/admin/Dashboard.jsx
import { useEffect, useState } from "react";
import { Link }                from "react-router-dom";
import { getAllTeams, setEligibility } from "../../lib/adminsupabase";
import "./Admin.css";

export default function Dashboard() {
  const [teams,   setTeams]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [error,   setError]   = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try   { setTeams(await getAllTeams()); }
    catch (e) { setError(e.message); }
    finally   { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function toggleEligible(teamId, stage, current) {
    try   { await setEligibility(teamId, stage, !current); await load(); }
    catch (e) { alert(e.message); }
  }

  const filtered = teams.filter(t =>
    [t.team_name, t.registration_number, t.university]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <div className="adm-topbar">
        <h1>Registered Teams <span className="adm-count">{teams.length}</span></h1>
        <input
          className="adm-search"
          type="text"
          placeholder="Search team, reg no, university…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Stat cards */}
      <div className="adm-stat-row">
        <div className="adm-stat">
          <span className="adm-stat-val">{teams.length}</span>
          <span className="adm-stat-lbl">Total Teams</span>
        </div>
        <div className="adm-stat">
          <span className="adm-stat-val">{teams.filter(t => t.stage1_files > 0).length}</span>
          <span className="adm-stat-lbl">Stage 1 Submitted</span>
        </div>
        <div className="adm-stat">
          <span className="adm-stat-val">{teams.filter(t => t.stage3_eligible).length}</span>
          <span className="adm-stat-lbl">Stage 3 Eligible</span>
        </div>
        <div className="adm-stat">
          <span className="adm-stat-val">{teams.filter(t => t.stage3_files > 0).length}</span>
          <span className="adm-stat-lbl">Stage 3 Submitted</span>
        </div>
      </div>

      {error   && <div className="adm-error">⚠ {error}</div>}
      {loading && <div className="adm-loading">Loading…</div>}

      {!loading && (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Reg No.</th>
                <th>Team Name</th>
                <th>University</th>
                <th>Members</th>
                <th>S1 Files</th>
                <th>S3 Files</th>
                <th>S3 Eligible</th>
                <th>Last Submit</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.registration_number}>
                  <td className="adm-mono adm-small">{t.registration_number}</td>
                  <td><strong>{t.team_name}</strong></td>
                  <td>{t.university}</td>
                  <td>{t.member_count}</td>
                  <td>
                    <span className={`adm-badge ${t.stage1_files > 0 ? "adm-badge--green" : "adm-badge--grey"}`}>
                      {t.stage1_files > 0 ? `✓ ${t.stage1_files}` : "—"}
                    </span>
                  </td>
                  <td>
                    <span className={`adm-badge ${t.stage3_files > 0 ? "adm-badge--green" : "adm-badge--grey"}`}>
                      {t.stage3_files > 0 ? `✓ ${t.stage3_files}` : "—"}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`adm-toggle ${t.stage3_eligible ? "adm-toggle--on" : ""}`}
                      onClick={() => toggleEligible(t.id, 3, t.stage3_eligible)}
                    >
                      {t.stage3_eligible ? "✓ Yes" : "No"}
                    </button>
                  </td>
                  <td className="adm-mono adm-small">
                    {t.last_submission
                      ? new Date(t.last_submission).toLocaleDateString("en-GB")
                      : "—"}
                  </td>
                  <td>
                    <Link to={`/admin/teams/${t.id}`} className="adm-view-btn">View →</Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="adm-empty">No teams found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
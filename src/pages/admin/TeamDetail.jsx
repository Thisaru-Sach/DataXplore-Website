// src/pages/admin/TeamDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link }     from "react-router-dom";
import { getTeam, getTeamSubmissions, getDownloadUrl, setEligibility } from "../../lib/adminsupabase";
import "./Admin.css";

export default function TeamDetail() {
  const { id } = useParams();
  const [team,    setTeam]    = useState(null);
  const [subs,    setSubs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  async function load() {
    setLoading(true);
    try {
      const [t, s] = await Promise.all([getTeam(id), getTeamSubmissions(id)]);
      setTeam(t);
      setSubs(s);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [id]);

  async function download(sub) {
    try {
      const url = await getDownloadUrl(sub.file_path);
      const a = document.createElement("a");
      a.href = url; a.download = sub.file_name; a.click();
    } catch (e) { alert(e.message); }
  }

  async function toggleEligible(stage, current) {
    try { await setEligibility(id, stage, !current); await load(); }
    catch (e) { alert(e.message); }
  }

  if (loading) return <div className="adm-loading">Loading…</div>;
  if (error)   return <div className="adm-error">⚠ {error}</div>;
  if (!team)   return <div className="adm-error">Team not found.</div>;

  // ✅ FIX: schema columns are member1/member2/member3/member4 (single text field each)
  // Not member1_name / member1_contact — those don't exist
  const members = [1, 2, 3, 4]
    .filter(n => team[`member${n}`])
    .map(n => ({ n, value: team[`member${n}`] }));

  return (
    <>
      <Link to="/admin" className="adm-back-link">← Back to Teams</Link>

      {/* Header */}
      <div className="adm-detail-header">
        <h1>{team.team_name}</h1>
        <div className="adm-detail-meta-row">
          <span className="adm-detail-university">{team.university}</span>
          {team.faculty && <><span className="adm-dot">·</span><span>{team.faculty}</span></>}
        </div>
      </div>

      {/* Tally metadata */}
      {(team.submission_id || team.respondent_id || team.submitted_at_tally) && (
        <section className="adm-detail-section">
          <h3 className="adm-section-title">Tally Registration Data</h3>
          <div className="adm-detail-grid">
            {team.submission_id && (
              <div className="adm-detail-card">
                <label>Submission ID</label>
                <strong className="adm-mono">{team.submission_id}</strong>
              </div>
            )}
            {team.respondent_id && (
              <div className="adm-detail-card">
                <label>Respondent ID</label>
                <strong className="adm-mono">{team.respondent_id}</strong>
              </div>
            )}
            {team.submitted_at_tally && (
              <div className="adm-detail-card">
                <label>Submitted on Tally</label>
                <strong>{new Date(team.submitted_at_tally).toLocaleString("en-GB")}</strong>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Lead registrant */}
      <section className="adm-detail-section">
        <h3 className="adm-section-title">Lead Registrant</h3>
        <div className="adm-detail-grid">
          <div className="adm-detail-card">
            <label>Full Name</label>
            <strong>{team.full_name}</strong>
          </div>
          {team.preferred_name && (
            <div className="adm-detail-card">
              <label>Preferred Name</label>
              <strong>{team.preferred_name}</strong>
            </div>
          )}
          <div className="adm-detail-card">
            <label>Email</label>
            <strong><a href={`mailto:${team.email}`} className="adm-link-inline">{team.email}</a></strong>
          </div>
          <div className="adm-detail-card">
            <label>Contact Number</label>
            <strong>{team.contact_number || "—"}</strong>
          </div>
          <div className="adm-detail-card">
            <label>NIC Number</label>
            <strong className="adm-mono">{team.nic_number || "—"}</strong>
          </div>
          <div className="adm-detail-card">
            <label>Academic Year</label>
            <strong>{team.academic_year || "—"}</strong>
          </div>
          <div className="adm-detail-card">
            <label>University</label>
            <strong>{team.university}</strong>
          </div>
          <div className="adm-detail-card">
            <label>Faculty</label>
            <strong>{team.faculty || "—"}</strong>
          </div>
          {team.student_id_url && (
            <div className="adm-detail-card adm-detail-card--full">
              <label>Student ID</label>
              <a href={team.student_id_url} target="_blank" rel="noreferrer" className="adm-id-link">
                🪪 View Student ID →
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Team members */}
      <section className="adm-detail-section">
        <h3 className="adm-section-title">Team Members ({members.length})</h3>
        {/* ✅ FIX: each member is a single text field "Name — contact"
            Display it as-is — no separate name/contact sub-fields */}
        <div className="adm-members-grid">
          {members.map(m => (
            <div key={m.n} className="adm-member-card">
              <div className="adm-member-num">Member {m.n}</div>
              <div className="adm-member-name">{m.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Competition eligibility */}
      <section className="adm-detail-section">
        <h3 className="adm-section-title">Competition Access</h3>
        <div className="adm-detail-grid">
          <div className="adm-detail-card">
            <label>Stage 1 Eligible</label>
            <strong>{team.stage1_eligible ? "✅ Yes" : "❌ No"}</strong>
          </div>
          <div className="adm-detail-card">
            <label>Stage 3 Eligible</label>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <strong>{team.stage3_eligible ? "✅ Yes" : "❌ No"}</strong>
              <button
                className={"adm-toggle " + (team.stage3_eligible ? "adm-toggle--on" : "")}
                onClick={() => toggleEligible(3, team.stage3_eligible)}
              >
                {team.stage3_eligible ? "Revoke" : "Grant"}
              </button>
            </div>
          </div>
          <div className="adm-detail-card">
            <label>Record Added</label>
            <strong>{new Date(team.created_at).toLocaleDateString("en-GB")}</strong>
          </div>
        </div>
      </section>

      {/* Submissions */}
      <section className="adm-detail-section">
        <h3 className="adm-section-title">Submissions ({subs.length})</h3>
        {subs.length === 0 ? (
          <p style={{ color:"var(--adm-muted)" }}>No submissions yet.</p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Stage</th><th>File</th><th>Size</th>
                  <th>Submitted</th><th>Notes</th><th>Download</th>
                </tr>
              </thead>
              <tbody>
                {subs.map(s => (
                  <tr key={s.id}>
                    <td><span className={"adm-badge adm-badge--s" + s.stage}>Stage {s.stage}</span></td>
                    <td className="adm-mono adm-small">{s.file_name}</td>
                    <td className="adm-mono adm-small">{fmtSize(s.file_size_bytes)}</td>
                    <td className="adm-mono adm-small">{new Date(s.submitted_at).toLocaleString("en-GB")}</td>
                    <td>{s.notes || "—"}</td>
                    <td>
                      <button className="adm-dl-btn" onClick={() => download(s)}>⬇ Download</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function fmtSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
// src/pages/admin/TeamDetail.jsx
import { useEffect, useState }     from "react";
import { useParams, Link }         from "react-router-dom";
import { adminSupabase, getDownloadUrl, setEligibility } from "../../lib/adminSupabase";
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
      const { data: t, error: te } = await adminSupabase
        .from("teams").select("*").eq("id", id).single();
      if (te) throw new Error(te.message);
      setTeam(t);

      const { data: s, error: se } = await adminSupabase
        .from("submissions").select("*").eq("team_id", id)
        .order("submitted_at", { ascending: false });
      if (se) throw new Error(se.message);
      setSubs(s ?? []);
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

  return (
    <>
      <Link to="/admin" className="adm-back-link">← Back to Teams</Link>

      <div className="adm-detail-header">
        <h1>{team.team_name}</h1>
        <span className="adm-detail-reg">{team.registration_number}</span>
      </div>

      <div className="adm-detail-grid">
        <div className="adm-detail-card"><label>University</label><strong>{team.university}</strong></div>
        <div className="adm-detail-card"><label>Email</label><strong>{team.email}</strong></div>
        <div className="adm-detail-card"><label>Phone</label><strong>{team.phone || "—"}</strong></div>
        <div className="adm-detail-card"><label>Members</label><strong>{team.member_count}</strong></div>
        <div className="adm-detail-card">
          <label>Registered At</label>
          <strong>{new Date(team.created_at).toLocaleDateString("en-GB")}</strong>
        </div>
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
      </div>

      <h2 style={{ marginBottom:16, color:"var(--adm-white)" }}>
        Submissions ({subs.length})
      </h2>

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
    </>
  );
}

function fmtSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
// src/pages/admin/Submissions.jsx
import { useEffect, useState } from "react";
import { getAllSubmissions, getDownloadUrl, deleteSubmission } from "../../lib/adminSupabase.js";
import "./Admin.css";

export default function Submissions() {
  const [subs,      setSubs]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [stage,     setStage]     = useState(null);
  const [search,    setSearch]    = useState("");
  const [dlLoading, setDlLoading] = useState({});
  const [error,     setError]     = useState("");

  async function load() {
    setLoading(true); setError("");
    try   { setSubs(await getAllSubmissions(stage)); }
    catch (e) { setError(e.message); }
    finally   { setLoading(false); }
  }

  useEffect(() => { load(); }, [stage]);

  async function download(sub) {
    setDlLoading(p => ({ ...p, [sub.id]: true }));
    try {
      const url = await getDownloadUrl(sub.file_path);
      const a = document.createElement("a");
      a.href = url; a.download = sub.file_name; a.click();
    } catch (e) { alert("Download failed: " + e.message); }
    finally { setDlLoading(p => ({ ...p, [sub.id]: false })); }
  }

  async function remove(sub) {
    if (!confirm(`Delete "${sub.file_name}"? This cannot be undone.`)) return;
    try   { await deleteSubmission(sub.id, sub.file_path); await load(); }
    catch (e) { alert(e.message); }
  }

  const filtered = subs.filter(s => {
    const q = search.toLowerCase();
    return (
      s.file_name.toLowerCase().includes(q) ||
      s.teams?.team_name?.toLowerCase().includes(q) ||
      s.teams?.registration_number?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="adm-topbar">
        <h1>Submissions <span className="adm-count">{subs.length}</span></h1>
        <div className="adm-controls">
          <div className="adm-stage-filter">
            {[null, 1, 3].map(s => (
              <button
                key={s ?? "all"}
                className={`adm-filter-btn ${stage === s ? "adm-filter-btn--on" : ""}`}
                onClick={() => setStage(s)}
              >
                {s === null ? "All" : `Stage ${s}`}
              </button>
            ))}
          </div>
          <input
            className="adm-search"
            type="text"
            placeholder="Search team or file…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error   && <div className="adm-error">⚠ {error}</div>}
      {loading && <div className="adm-loading">Loading…</div>}

      {!loading && (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Stage</th>
                <th>Team</th>
                <th>Reg No.</th>
                <th>File Name</th>
                <th>Size</th>
                <th>Submitted At</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <span className={`adm-badge adm-badge--s${s.stage}`}>
                      Stage {s.stage}
                    </span>
                  </td>
                  <td><strong>{s.teams?.team_name ?? "—"}</strong></td>
                  <td className="adm-mono adm-small">{s.teams?.registration_number ?? "—"}</td>
                  <td className="adm-mono adm-small">{s.file_name}</td>
                  <td className="adm-mono adm-small">{fmtSize(s.file_size_bytes)}</td>
                  <td className="adm-mono adm-small">
                    {new Date(s.submitted_at).toLocaleString("en-GB")}
                  </td>
                  <td className="adm-notes">{s.notes || "—"}</td>
                  <td>
                    <div className="adm-action-row">
                      <button
                        className="adm-dl-btn"
                        onClick={() => download(s)}
                        disabled={dlLoading[s.id]}
                      >
                        {dlLoading[s.id] ? "…" : "⬇ Download"}
                      </button>
                      <button className="adm-del-btn" onClick={() => remove(s)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="adm-empty">No submissions found.</td></tr>
              )}
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
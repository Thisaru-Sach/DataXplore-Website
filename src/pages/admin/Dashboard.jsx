// src/pages/admin/Dashboard.jsx
import { useEffect, useState } from "react";
import { Link }                from "react-router-dom";
import { getAllTeams, setEligibility, insertTeam } from "../../lib/adminsupabase";
import "./Admin.css";

const EMPTY = {
  submission_id: "", respondent_id: "", submitted_at_tally: "",
  full_name: "", preferred_name: "",
  university: "", faculty: "",
  nic_number: "", student_id_url: "",
  email: "", contact_number: "", academic_year: "",
  team_name: "", member_count: "3",
  // ✅ FIX: field names match schema columns exactly (member1, not member1_name)
  member1: "",
  member2: "",
  member3: "",
  member4: "",
  stage1_eligible: true, stage3_eligible: false,
};

export default function Dashboard() {
  const [teams,   setTeams]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [error,   setError]   = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState(EMPTY);
  const [formErr, setFormErr] = useState("");

  async function load() {
    setLoading(true); setError("");
    try   { setTeams(await getAllTeams()); }
    catch (e) { setError(e.message); }
    finally   { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function toggleEligible(teamId, stage, current) {
    try   { await setEligibility(teamId, stage, !current); await load(); }
    catch (e) { alert(e.message); }
  }

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  async function saveTeam(e) {
    e.preventDefault();
    setFormErr("");

    // ✅ FIX: validate correct field names
    const required = ["full_name", "university", "email", "team_name",
                      "member1", "member2", "member3"];
    const missing = required.filter(k => !form[k].trim());
    if (missing.length) {
      setFormErr(`Please fill in: ${missing.join(", ")}`);
      return;
    }
    if (parseInt(form.member_count) === 4 && !form.member4.trim()) {
      setFormErr("Member 4 is required for a 4-member team.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        submission_id:      form.submission_id      || null,
        respondent_id:      form.respondent_id      || null,
        submitted_at_tally: form.submitted_at_tally || null,
        full_name:          form.full_name.trim(),
        preferred_name:     form.preferred_name     || null,
        university:         form.university.trim(),
        faculty:            form.faculty            || null,
        nic_number:         form.nic_number         || null,
        student_id_url:     form.student_id_url     || null,
        email:              form.email.trim().toLowerCase(),
        contact_number:     form.contact_number     || null,
        academic_year:      form.academic_year      || null,
        team_name:          form.team_name.trim(),
        member_count:       parseInt(form.member_count),
        // ✅ FIX: use member1/2/3/4 directly matching schema
        member1: form.member1.trim() || null,
        member2: form.member2.trim() || null,
        member3: form.member3.trim() || null,
        member4: parseInt(form.member_count) === 4 ? (form.member4.trim() || null) : null,
        stage1_eligible:    form.stage1_eligible,
        stage3_eligible:    form.stage3_eligible,
      };

      const { error } = await insertTeam.from("teams").insert(payload);
      if (error) throw new Error(error.message);

      setShowAdd(false);
      setForm(EMPTY);
      await load();
    } catch (err) {
      setFormErr(err.message);
    } finally {
      setSaving(false);
    }
  }

  const filtered = teams.filter(t =>
    [t.team_name, t.university, t.full_name, t.email, t.nic_number]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <div className="adm-topbar">
        <h1>Registered Teams <span className="adm-count">{teams.length}</span></h1>
        <div className="adm-controls">
          <input
            className="adm-search"
            type="text"
            placeholder="Search name, team, NIC, email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="adm-add-btn" onClick={() => { setForm(EMPTY); setFormErr(""); setShowAdd(true); }}>
            + Add Team
          </button>
        </div>
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
                <th>NIC No.</th>
                <th>Team Name</th>
                <th>Lead Registrant</th>
                <th>University</th>
                <th>Faculty</th>
                <th>Email</th>
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
                <tr key={t.id}>
                  <td className="adm-mono adm-small">{t.nic_number || "—"}</td>
                  <td><strong>{t.team_name}</strong></td>
                  <td>
                    {t.full_name}
                    {t.preferred_name && <span className="adm-preferred"> ({t.preferred_name})</span>}
                  </td>
                  <td>{t.university}</td>
                  <td>{t.faculty || "—"}</td>
                  <td className="adm-mono adm-small">{t.email}</td>
                  <td style={{ textAlign: "center" }}>{t.member_count}</td>
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
                <tr><td colSpan={12} className="adm-empty">No teams found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add Team Modal ── */}
      {showAdd && (
        <div className="adm-modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2>Add Team</h2>
              <button className="adm-modal-close" onClick={() => setShowAdd(false)}>✕</button>
            </div>

            <form onSubmit={saveTeam} className="adm-team-form">

              {/* Tally metadata */}
              <div className="adm-form-section">
                <div className="adm-form-section-title">Tally Metadata</div>
                <div className="adm-form-row">
                  <label>Submission ID<input name="submission_id" value={form.submission_id} onChange={onChange} placeholder="From Tally export" /></label>
                  <label>Respondent ID<input name="respondent_id" value={form.respondent_id} onChange={onChange} placeholder="From Tally export" /></label>
                </div>
                <div className="adm-form-row">
                  <label>Submitted At (Tally)<input name="submitted_at_tally" type="datetime-local" value={form.submitted_at_tally} onChange={onChange} /></label>
                </div>
              </div>

              {/* Lead registrant */}
              <div className="adm-form-section">
                <div className="adm-form-section-title">Lead Registrant</div>
                <div className="adm-form-row">
                  <label>Full Name <span className="req">*</span><input name="full_name" value={form.full_name} onChange={onChange} /></label>
                  <label>Preferred Name<input name="preferred_name" value={form.preferred_name} onChange={onChange} /></label>
                </div>
                <div className="adm-form-row">
                  <label>University <span className="req">*</span><input name="university" value={form.university} onChange={onChange} /></label>
                  <label>Faculty<input name="faculty" value={form.faculty} onChange={onChange} /></label>
                </div>
                <div className="adm-form-row">
                  <label>NIC Number<input name="nic_number" value={form.nic_number} onChange={onChange} /></label>
                  <label>Academic Year<input name="academic_year" value={form.academic_year} onChange={onChange} placeholder="e.g. 2nd Year" /></label>
                </div>
                <div className="adm-form-row">
                  <label>Email Address <span className="req">*</span><input name="email" type="email" value={form.email} onChange={onChange} /></label>
                  <label>Contact Number<input name="contact_number" value={form.contact_number} onChange={onChange} /></label>
                </div>
                <div className="adm-form-row">
                  <label>Student ID URL<input name="student_id_url" value={form.student_id_url} onChange={onChange} placeholder="https://..." /></label>
                </div>
              </div>

              {/* Team */}
              <div className="adm-form-section">
                <div className="adm-form-section-title">Team</div>
                <div className="adm-form-row">
                  <label>Team Name <span className="req">*</span><input name="team_name" value={form.team_name} onChange={onChange} /></label>
                  <label>
                    Number of Members <span className="req">*</span>
                    <select name="member_count" value={form.member_count} onChange={onChange}>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </label>
                </div>
              </div>

              {/* ✅ FIX: Members — use name="member1" not name="member1_name" */}
              <div className="adm-form-section">
                <div className="adm-form-section-title">
                  Team Members
                  <span style={{ fontWeight:400, color:"#8b949e", marginLeft:8 }}>
                    (format: Full Name — +94 7X XXX XXXX)
                  </span>
                </div>
                {[1, 2, 3].map(n => (
                  <div key={n} className="adm-form-row">
                    <label>
                      Member {n} <span className="req">*</span>
                      <input
                        name={`member${n}`}
                        value={form[`member${n}`]}
                        onChange={onChange}
                        placeholder="Full Name — +94 71 XXX XXXX"
                      />
                    </label>
                  </div>
                ))}
                {parseInt(form.member_count) === 4 && (
                  <div className="adm-form-row">
                    <label>
                      Member 4 <span className="req">*</span>
                      <input
                        name="member4"
                        value={form.member4}
                        onChange={onChange}
                        placeholder="Full Name — +94 71 XXX XXXX"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Eligibility */}
              <div className="adm-form-section">
                <div className="adm-form-section-title">Competition Access</div>
                <div className="adm-form-row adm-form-checkrow">
                  <label className="adm-check-label">
                    <input type="checkbox" name="stage1_eligible" checked={form.stage1_eligible} onChange={onChange} />
                    Stage 1 Eligible
                  </label>
                  <label className="adm-check-label">
                    <input type="checkbox" name="stage3_eligible" checked={form.stage3_eligible} onChange={onChange} />
                    Stage 3 Eligible
                  </label>
                </div>
              </div>

              {formErr && <div className="adm-error" style={{ margin:"0 0 12px" }}>⚠ {formErr}</div>}

              <div className="adm-form-actions">
                <button type="button" className="adm-form-cancel" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="adm-form-save" disabled={saving}>
                  {saving ? "Saving…" : "Save Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
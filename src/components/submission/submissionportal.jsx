// src/components/submission/SubmissionPortal.jsx
// ─────────────────────────────────────────────────────────
//  Shown after AuthGate confirms the team.
//  Accepts: R scripts, R Markdown, Jupyter Notebooks,
//           Excel, Minitab, PDF, CSV
//
//  Files are currently stored in component state only.
//  TODO: wire up Supabase Storage upload when DB is ready.
// ─────────────────────────────────────────────────────────
import { useState, useRef, useCallback } from "react";
import { Link }                           from "react-router-dom";
import "./SubmissionPortal.css";

// Accepted file types
const ACCEPTED = {
  "application/pdf":                          [".pdf"],
  "application/vnd.ms-excel":                [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "text/plain":                               [".r", ".R", ".rmd", ".Rmd", ".txt"],
  "application/octet-stream":                 [".rmd", ".Rmd", ".mtw", ".mtj"],
  "application/x-ipynb+json":               [".ipynb"],
  "text/x-python":                            [".py"],
};

const ACCEPTED_EXT = [".pdf", ".xls", ".xlsx", ".R", ".r", ".rmd", ".Rmd", ".ipynb", ".py", ".csv", ".mtw", ".mtj"];
const MAX_FILE_SIZE_MB = 50;

const STAGE_INFO = {
  1: {
    label: "Stage 1 — EDA & Insight Report",
    instructions: [
      "Upload your EDA report as a PDF.",
      "Include your R Markdown (.rmd) or Jupyter Notebook (.ipynb) file.",
      "Include any supporting data files.",
      "Do NOT include personal information or university name in the files.",
      "Only include your Team Name and Registration Number.",
    ],
  },
  3: {
    label: "Stage 3 — Model Building & Dashboard",
    instructions: [
      "Upload your final full report as a PDF.",
      "Include your R Markdown / R Script or Jupyter Notebook.",
      "Upload your dashboard file or a PDF export of the dashboard.",
      "Do NOT include personal information or university name in the files.",
      "Only include your Team Name and Registration Number.",
    ],
  },
};

export default function SubmissionPortal({ team, stage }) {
  const [files,      setFiles]      = useState([]);   // { file, id, status, error }
  const [notes,      setNotes]      = useState("");
  const [submitted,  setSubmitted]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver,   setDragOver]   = useState(false);

  const inputRef = useRef(null);

  const stageInfo = STAGE_INFO[stage] || STAGE_INFO[1];

  // ── File validation ────────────────────────────────────
  function validateFile(file) {
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!ACCEPTED_EXT.some(a => a.toLowerCase() === ext)) {
      return `File type "${ext}" is not accepted.`;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File exceeds ${MAX_FILE_SIZE_MB}MB limit.`;
    }
    return null;
  }

  // ── Add files ──────────────────────────────────────────
  const addFiles = useCallback((incoming) => {
    const newEntries = Array.from(incoming).map(file => ({
      file,
      id:     crypto.randomUUID(),
      status: "pending",   // pending | uploading | done | error
      error:  validateFile(file),
    }));
    setFiles(prev => [...prev, ...newEntries]);
  }, []);

  // ── Drag & drop handlers ───────────────────────────────
  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }

  function onDragOver(e) { e.preventDefault(); setDragOver(true);  }
  function onDragLeave()  {                     setDragOver(false); }

  function removeFile(id) {
    setFiles(prev => prev.filter(f => f.id !== id));
  }

  // ── Final submission ───────────────────────────────────
  async function handleSubmit() {
    const validFiles = files.filter(f => !f.error);
    if (validFiles.length === 0) return;

    setSubmitting(true);

    // Simulate upload progress per file
    for (const entry of validFiles) {
      setFiles(prev =>
        prev.map(f => f.id === entry.id ? { ...f, status: "uploading" } : f)
      );
      await delay(600 + Math.random() * 400);

      // TODO: replace with Supabase Storage upload:
      // const path = `stage${stage}/${team.registration_number}/${entry.file.name}`;
      // const { error } = await supabase.storage
      //   .from("submissions")
      //   .upload(path, entry.file);
      //
      // Then insert into submissions table:
      // await supabase.from("submissions").insert({
      //   team_id:    team.id,
      //   stage:      stage,
      //   file_name:  entry.file.name,
      //   file_path:  path,
      //   notes:      notes,
      // });

      setFiles(prev =>
        prev.map(f => f.id === entry.id ? { ...f, status: "done" } : f)
      );
    }

    setSubmitting(false);
    setSubmitted(true);
  }

  // ── Success screen ─────────────────────────────────────
  if (submitted) {
    return (
      <div className="portal-wrap">
        <div className="portal-card portal-card--success">
          <div className="success-icon">✅</div>
          <h2 className="portal-title">Submission Received!</h2>
          <p className="portal-sub">
            Your files for <strong>{stageInfo.label}</strong> have been submitted successfully.
          </p>
          <div className="success-meta">
            <div><span>Team</span><strong>{team.team_name}</strong></div>
            <div><span>Reg. No.</span><strong>{team.registration_number}</strong></div>
            <div><span>Stage</span><strong>{stage}</strong></div>
            <div><span>Files</span><strong>{files.filter(f => !f.error).length} file(s)</strong></div>
          </div>
          <p className="portal-note">
            Keep this confirmation. If you need to re-submit, contact the organizers.
          </p>
          <Link to="/" className="btn-outline-sub">← Back to Home</Link>
        </div>
      </div>
    );
  }

  const hasValid   = files.some(f => !f.error);
  const hasInvalid = files.some(f =>  f.error);

  return (
    <div className="portal-wrap">
      <div className="portal-card">

        {/* Header */}
        <div className="portal-header">
          <span className="portal-eyebrow">DataXplore 2.0</span>
          <h1 className="portal-title">{stageInfo.label}</h1>
          <div className="portal-team-badge">
            <span>👥 {team.team_name}</span>
            <span className="sep">·</span>
            <span className="reg">{team.registration_number}</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="portal-instructions">
          <p className="portal-instructions__head">Submission Guidelines</p>
          <ul>
            {stageInfo.instructions.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>

        {/* Drop zone */}
        <div
          className={`drop-zone ${dragOver ? "drop-zone--over" : ""}`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === "Enter" && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            style={{ display: "none" }}
            accept={ACCEPTED_EXT.join(",")}
            onChange={e => addFiles(e.target.files)}
          />
          <div className="drop-zone__icon">📂</div>
          <p className="drop-zone__main">
            {dragOver ? "Drop files here" : "Drag & drop files, or click to browse"}
          </p>
          <p className="drop-zone__sub">
            Accepted: {ACCEPTED_EXT.join(", ")} · Max {MAX_FILE_SIZE_MB}MB per file
          </p>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <ul className="file-list">
            {files.map(entry => (
              <li key={entry.id} className={`file-item file-item--${entry.error ? "error" : entry.status}`}>
                <span className="file-icon">{fileIcon(entry.file.name)}</span>
                <div className="file-info">
                  <span className="file-name">{entry.file.name}</span>
                  <span className="file-size">{formatSize(entry.file.size)}</span>
                  {entry.error && <span className="file-error">{entry.error}</span>}
                </div>
                <span className="file-status">
                  {entry.status === "uploading" && <span className="spinner-dot" />}
                  {entry.status === "done"      && "✓"}
                  {entry.error                  && "✕"}
                </span>
                {entry.status === "pending" && (
                  <button
                    className="file-remove"
                    onClick={() => removeFile(entry.id)}
                    title="Remove"
                  >×</button>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Notes */}
        <div className="portal-notes">
          <label htmlFor="notes">
            Notes to Organizers <span>(optional)</span>
          </label>
          <textarea
            id="notes"
            rows={3}
            placeholder="Any notes about your submission…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            disabled={submitting}
          />
        </div>

        {/* Warnings */}
        {hasInvalid && (
          <div className="portal-warning">
            ⚠ Some files have errors and will be skipped. Fix or remove them before submitting.
          </div>
        )}

        {/* Submit button */}
        <button
          className="portal-submit"
          disabled={!hasValid || submitting}
          onClick={handleSubmit}
        >
          {submitting ? "Uploading…" : `Submit ${hasValid ? files.filter(f => !f.error).length : ""} File(s) →`}
        </button>

        <Link to="/" className="auth-back">← Back to Home</Link>

      </div>
    </div>
  );
}

/* ── Tiny helpers ─────────────────────────────────────────── */
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function formatSize(bytes) {
  if (bytes < 1024)        return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function fileIcon(name) {
  const ext = name.split(".").pop().toLowerCase();
  const map = { pdf: "📄", xlsx: "📊", xls: "📊", r: "📈", rmd: "📈", ipynb: "🐍", py: "🐍", csv: "📋", mtw: "📉", mtj: "📉" };
  return map[ext] || "📁";
}
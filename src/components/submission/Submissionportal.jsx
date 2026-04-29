// src/components/submission/Submissionportal.jsx
// Only change from previous version: uploadFile() now returns
// { path, record } instead of just a path string, because
// the server saves the DB row and returns it.
import { useState, useRef, useCallback, useEffect } from "react";
import { Link }                                      from "react-router-dom";
import JSZip                                         from "jszip";
import {
  uploadFile,
  getExistingSubmission,
  deleteSubmissionRow,
} from "../../lib/supabase";
import "./Submissionportal.css";

const ACCEPTED_EXT     = [".pdf", ".xls", ".xlsx", ".R", ".r", ".rmd", ".Rmd", ".ipynb", ".py", ".csv", ".mtw", ".mtj", ".txt"];
const MAX_FILE_SIZE_MB = 50;
const MAX_TOTAL_MB     = 50;

const STAGE_INFO = {
  1: {
    label:    "Stage 1 — Data Analysis & Report",
    deadline: "24th April 2026 before 12:00 noon",
    instructions: [
      "Upload your analysis report as a PDF.",
      "Include your R Markdown (.rmd), R Script (.R), or Jupyter Notebook (.ipynb).",
      "Include any supporting data or CSV files.",
      "Do NOT include your university name or personal info in the files.",
      "Only include your Team Name.",
      "All files will be zipped automatically before upload.",
    ],
  },
  3: {
    label:    "Stage 3 — Dashboard Competition",
    deadline: "10th May 2026",
    instructions: [
      "Upload your final full report as a PDF.",
      "Include your dashboard file or a PDF export of the dashboard.",
      "Include your R Markdown / R Script or Jupyter Notebook.",
      "Do NOT include your university name or personal info in the files.",
      "Only include your Team Name.",
      "All files will be zipped automatically before upload.",
    ],
  },
};

export default function SubmissionPortal({ team, stage }) {
  const [files,        setFiles]        = useState([]);
  const [notes,        setNotes]        = useState("");
  const [submitted,    setSubmitted]    = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [progress,     setProgress]     = useState("");
  const [dragOver,     setDragOver]     = useState(false);
  const [uploadedMeta, setUploadedMeta] = useState(null);
  const [existing,     setExisting]     = useState(null);
  const [checkingPrev, setCheckingPrev] = useState(true);

  const inputRef  = useRef(null);
  const stageInfo = STAGE_INFO[stage] || STAGE_INFO[1];
  const eligible  = stage === 1 ? team.stage1_eligible : team.stage3_eligible;

  useEffect(() => {
    async function check() {
      try {
        const prev = await getExistingSubmission(team.id, stage);
        setExisting(prev);
      } catch (e) {
        console.warn("Could not check prior submission:", e.message);
      } finally {
        setCheckingPrev(false);
      }
    }
    check();
  }, [team.id, stage]);

  function validateFile(file) {
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!ACCEPTED_EXT.some(a => a.toLowerCase() === ext))
      return `File type "${ext}" is not accepted.`;
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024)
      return `File exceeds ${MAX_FILE_SIZE_MB} MB limit.`;
    return null;
  }

  const addFiles = useCallback((incoming) => {
    const newEntries = Array.from(incoming).map(file => ({
      file, id: crypto.randomUUID(), status: "pending", error: validateFile(file),
    }));
    setFiles(prev => [...prev, ...newEntries]);
  }, []);

  function removeFile(id) { setFiles(prev => prev.filter(f => f.id !== id)); }

  const validFiles = files.filter(f => !f.error);
  const totalBytes = validFiles.reduce((s, f) => s + f.file.size, 0);
  const totalMB    = (totalBytes / (1024 * 1024)).toFixed(1);
  const tooLarge   = totalBytes > MAX_TOTAL_MB * 1024 * 1024;
  const hasValid   = validFiles.length > 0 && !tooLarge;
  const hasInvalid = files.some(f => f.error);

  function onDrop(e)      { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files); }
  function onDragOver(e)  { e.preventDefault(); setDragOver(true); }
  function onDragLeave()  { setDragOver(false); }

  async function handleSubmit() {
    if (!hasValid || submitting) return;

    if (existing) {
      const confirmed = window.confirm(
        `You already have a submission for Stage ${stage}:\n` +
        `"${existing.file_name}"\n` +
        `Submitted: ${new Date(existing.submitted_at).toLocaleString("en-GB")}\n\n` +
        `Proceeding will DELETE the previous submission.\n\nContinue?`
      );
      if (!confirmed) return;
    }

    setSubmitting(true);
    try {
      setProgress("Compressing files…");
      const zip    = new JSZip();
      const folder = zip.folder(`${team.team_name}_stage${stage}`);
      for (const entry of validFiles) folder.file(entry.file.name, entry.file);

      const zipBlob = await zip.generateAsync(
        { type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } },
        ({ percent }) => setProgress(`Compressing… ${Math.round(percent)}%`)
      );

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const zipName   = `${team.team_name}_stage${stage}_${timestamp}.zip`;
      const zipFile   = new File([zipBlob], zipName, { type: "application/zip" });

      if (existing) {
        setProgress("Removing previous submission…");
        try { await deleteSubmissionRow(existing.id); } catch {}
      }

      setProgress("Uploading to server…");
      // ✅ uploadFile now handles both storage upload AND DB insert server-side
      const { record } = await uploadFile(
        zipFile, stage, team.team_name, team.id, notes.trim() || null
      );

      setUploadedMeta(record);
      setExisting(record);
      setSubmitted(true);

    } catch (err) {
      setProgress("");
      alert(`Upload failed: ${err.message}\n\nPlease try again or contact the organizers.`);
    } finally {
      setSubmitting(false);
    }
  }

  if (!eligible) {
    return (
      <div className="portal-wrap">
        <div className="portal-card portal-card--success">
          <div className="success-icon">🔒</div>
          <h2 className="portal-title">Not Eligible for Stage {stage}</h2>
          <p className="portal-sub">
            Your team is not currently eligible to submit for Stage {stage}.
            {stage === 3 && " Only Top 10 teams from Stage 1 can submit for Stage 3."}
          </p>
          <Link to="/" className="btn-outline-sub">← Back to Home</Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="portal-wrap">
        <div className="portal-card portal-card--success">
          <div className="success-icon">✅</div>
          <h2 className="portal-title">Submission Received!</h2>
          <p className="portal-sub">
            Your files for <strong>{stageInfo.label}</strong> have been uploaded successfully.
          </p>
          <div className="success-meta">
            <div><span>Team</span><strong>{team.team_name}</strong></div>
            <div><span>Stage</span><strong>{stage}</strong></div>
            <div><span>Files zipped</span><strong>{validFiles.length} file(s)</strong></div>
            {uploadedMeta && (
              <div><span>Submitted at</span>
                <strong>{new Date(uploadedMeta.submitted_at).toLocaleString("en-GB")}</strong>
              </div>
            )}
          </div>
          <p className="portal-note">Screenshot this for your records.</p>
          <Link to="/" className="btn-outline-sub">← Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-wrap">
      <div className="portal-card">
        <div className="portal-header">
          <span className="portal-eyebrow">DataXplore 2.0</span>
          <h1 className="portal-title">{stageInfo.label}</h1>
          <div className="portal-team-badge">
            <span>👥 {team.team_name}</span>
          </div>
          <div className="portal-deadline">
            ⏰ Deadline: <strong>{stageInfo.deadline}</strong>
          </div>
        </div>

        {!checkingPrev && existing && (
          <div className="portal-resubmit-notice">
            <span className="portal-resubmit-icon">⚠️</span>
            <div>
              <strong>Existing submission for Stage {stage}</strong>
              <p>File: <code>{existing.file_name}</code><br />
                Submitted: {new Date(existing.submitted_at).toLocaleString("en-GB")}</p>
              <p>Uploading new files will <strong>permanently replace</strong> this submission.</p>
            </div>
          </div>
        )}

        <div className="portal-instructions">
          <p className="portal-instructions__head">Submission Guidelines</p>
          <ul>{stageInfo.instructions.map((line, i) => <li key={i}>{line}</li>)}</ul>
        </div>

        <div
          className={`drop-zone ${dragOver ? "drop-zone--over" : ""}`}
          onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
          onClick={() => !submitting && inputRef.current?.click()}
          role="button" tabIndex={0}
          onKeyDown={e => e.key === "Enter" && !submitting && inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" multiple style={{ display:"none" }}
            accept={ACCEPTED_EXT.join(",")} onChange={e => addFiles(e.target.files)} disabled={submitting} />
          <div className="drop-zone__icon">📂</div>
          <p className="drop-zone__main">{dragOver ? "Drop files here" : "Drag & drop files, or click to browse"}</p>
          <p className="drop-zone__sub">Accepted: {ACCEPTED_EXT.join(", ")} · Max {MAX_FILE_SIZE_MB} MB per file</p>
          <p className="drop-zone__sub">Files will be zipped automatically before upload.</p>
        </div>

        {files.length > 0 && (
          <>
            <ul className="file-list">
              {files.map(entry => (
                <li key={entry.id} className={`file-item file-item--${entry.error ? "error" : entry.status}`}>
                  <span className="file-icon">{fileIcon(entry.file.name)}</span>
                  <div className="file-info">
                    <span className="file-name">{entry.file.name}</span>
                    <span className="file-size">{formatSize(entry.file.size)}</span>
                    {entry.error && <span className="file-error">{entry.error}</span>}
                  </div>
                  <span className="file-status">{entry.error && "✕"}</span>
                  {!submitting && <button className="file-remove" onClick={() => removeFile(entry.id)}>×</button>}
                </li>
              ))}
            </ul>
            <div className={`portal-size-bar ${tooLarge ? "portal-size-bar--over" : ""}`}>
              <span>Total: <strong>{totalMB} MB</strong> / {MAX_TOTAL_MB} MB</span>
              {tooLarge && <span className="size-warn">⚠ Exceeds limit</span>}
            </div>
          </>
        )}

        <div className="portal-notes">
          <label htmlFor="notes">Notes to Organizers <span>(optional)</span></label>
          <textarea id="notes" rows={3} placeholder="Any notes about your submission…"
            value={notes} onChange={e => setNotes(e.target.value)} disabled={submitting} />
        </div>

        {hasInvalid && <div className="portal-warning">⚠ Files with errors will be skipped.</div>}

        {submitting && progress && (
          <div className="portal-progress"><span className="spinner-dot" /><span>{progress}</span></div>
        )}

        <button className="portal-submit" disabled={!hasValid || submitting} onClick={handleSubmit}>
          {submitting ? "Processing…" : existing
            ? `Replace & Submit ${validFiles.length} File(s) →`
            : `Zip & Submit ${validFiles.length} File(s) →`}
        </button>
        <Link to="/" className="auth-back">← Back to Home</Link>
      </div>
    </div>
  );
}

function formatSize(bytes) {
  if (bytes < 1024)         return bytes + " B";
  if (bytes < 1024 * 1024)  return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
function fileIcon(name) {
  const ext = name.split(".").pop().toLowerCase();
  const map = { pdf:"📄", xlsx:"📊", xls:"📊", r:"📈", rmd:"📈", ipynb:"🐍", py:"🐍", csv:"📋", mtw:"📉", mtj:"📉" };
  return map[ext] || "📁";
}
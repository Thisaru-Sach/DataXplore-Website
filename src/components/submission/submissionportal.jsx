// src/components/submission/SubmissionPortal.jsx
// ─────────────────────────────────────────────────────────
//  Full Supabase-connected upload portal.
//  Flow:
//    1. User selects files (drag & drop or browse)
//    2. On submit: all valid files are zipped client-side
//       using the JSZip library (no server needed)
//    3. The zip is uploaded to Supabase Storage
//    4. Metadata (path, size, stage, team) saved to DB
//
//  Requires:  npm install jszip
// ─────────────────────────────────────────────────────────
import { useState, useRef, useCallback } from "react";
import { Link }                           from "react-router-dom";
import JSZip                              from "jszip";
import { uploadFile, saveSubmission, getTeamSubmissions } from "../../lib/supabase";
import "./SubmissionPortal.css";

const ACCEPTED_EXT    = [".pdf", ".xls", ".xlsx", ".R", ".r", ".rmd", ".Rmd", ".ipynb", ".py", ".csv", ".mtw", ".mtj", ".txt"];
const MAX_FILE_SIZE_MB = 50;
const MAX_TOTAL_MB     = 200;

const STAGE_INFO = {
  1: {
    label: "Stage 1 — Data Analysis & Report",
    deadline: "24th April 2026 before 12:00 noon",
    instructions: [
      "Upload your analysis report as a PDF.",
      "Include your R Markdown (.rmd), R Script (.R), or Jupyter Notebook (.ipynb).",
      "Include any supporting data or CSV files.",
      "Do NOT include your university name or personal info in the files.",
      "Only include your Team Name and Registration Number.",
      "All files will be zipped automatically before upload.",
    ],
  },
  3: {
    label: "Stage 3 — Dashboard Competition",
    deadline: "10th May 2026",
    instructions: [
      "Upload your final full report as a PDF.",
      "Include your dashboard file or a PDF export of the dashboard.",
      "Include your R Markdown / R Script or Jupyter Notebook.",
      "Do NOT include your university name or personal info in the files.",
      "Only include your Team Name and Registration Number.",
      "All files will be zipped automatically before upload.",
    ],
  },
};

export default function SubmissionPortal({ team, stage }) {
  const [files,      setFiles]      = useState([]);
  const [notes,      setNotes]      = useState("");
  const [submitted,  setSubmitted]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progress,   setProgress]   = useState("");   // status message during upload
  const [dragOver,   setDragOver]   = useState(false);
  const [uploadedMeta, setUploadedMeta] = useState(null); // saved submission record

  const inputRef  = useRef(null);
  const stageInfo = STAGE_INFO[stage] || STAGE_INFO[1];

  // ── Eligibility check ─────────────────────────────────
  const eligible = stage === 1 ? team.stage1_eligible : team.stage3_eligible;

  // ── File validation ────────────────────────────────────
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
      file,
      id:     crypto.randomUUID(),
      status: "pending",
      error:  validateFile(file),
    }));
    setFiles(prev => [...prev, ...newEntries]);
  }, []);

  function removeFile(id) {
    setFiles(prev => prev.filter(f => f.id !== id));
  }

  // ── Total size check ───────────────────────────────────
  const validFiles    = files.filter(f => !f.error);
  const totalBytes    = validFiles.reduce((s, f) => s + f.file.size, 0);
  const totalMB       = (totalBytes / (1024 * 1024)).toFixed(1);
  const tooLarge      = totalBytes > MAX_TOTAL_MB * 1024 * 1024;
  const hasValid      = validFiles.length > 0 && !tooLarge;
  const hasInvalid    = files.some(f => f.error);

  // ── Drag & drop ────────────────────────────────────────
  function onDrop(e) {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }
  function onDragOver(e) { e.preventDefault(); setDragOver(true);  }
  function onDragLeave()  { setDragOver(false); }

  // ── Main submit ────────────────────────────────────────
  async function handleSubmit() {
    if (!hasValid || submitting) return;
    setSubmitting(true);

    try {
      // Step 1: zip all valid files
      setProgress("Compressing files…");
      const zip       = new JSZip();
      const folder    = zip.folder(`${team.registration_number}_stage${stage}`);

      for (const entry of validFiles) {
        folder.file(entry.file.name, entry.file);
      }

      const zipBlob = await zip.generateAsync(
        { type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } },
        ({ percent }) => setProgress(`Compressing… ${Math.round(percent)}%`)
      );

      // Step 2: build a File object from the blob so uploadFile() works
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const zipName   = `${team.registration_number}_stage${stage}_${timestamp}.zip`;
      const zipFile   = new File([zipBlob], zipName, { type: "application/zip" });

      // Step 3: upload zip to Supabase Storage
      setProgress("Uploading to server…");
      const storagePath = await uploadFile(zipFile, stage, team.registration_number);

      // Step 4: save metadata to submissions table
      setProgress("Saving record…");
      const record = await saveSubmission({
        teamId:         team.id,
        stage,
        filePath:       storagePath,
        fileName:       zipName,
        fileSizeBytes:  zipFile.size,
        fileType:       "zip",
        notes:          notes.trim() || null,
      });

      setUploadedMeta(record);
      setSubmitted(true);

    } catch (err) {
      setProgress("");
      alert(`Upload failed: ${err.message}\n\nPlease try again or contact the organizers.`);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Not eligible screen ────────────────────────────────
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

  // ── Success screen ─────────────────────────────────────
  if (submitted) {
    return (
      <div className="portal-wrap">
        <div className="portal-card portal-card--success">
          <div className="success-icon">✅</div>
          <h2 className="portal-title">Submission Received!</h2>
          <p className="portal-sub">
            Your files for <strong>{stageInfo.label}</strong> have been
            uploaded and saved successfully.
          </p>
          <div className="success-meta">
            <div><span>Team</span><strong>{team.team_name}</strong></div>
            <div><span>Reg. No.</span><strong>{team.registration_number}</strong></div>
            <div><span>Stage</span><strong>{stage}</strong></div>
            <div><span>Files zipped</span><strong>{validFiles.length} file(s)</strong></div>
            {uploadedMeta && (
              <div>
                <span>Submitted at</span>
                <strong>{new Date(uploadedMeta.submitted_at).toLocaleString("en-GB")}</strong>
              </div>
            )}
          </div>
          <p className="portal-note">
            Screenshot this page for your records. Contact organizers if you need to resubmit.
          </p>
          <Link to="/" className="btn-outline-sub">← Back to Home</Link>
        </div>
      </div>
    );
  }

  // ── Upload form ────────────────────────────────────────
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
          <div className="portal-deadline">
            ⏰ Deadline: <strong>{stageInfo.deadline}</strong>
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
          onClick={() => !submitting && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === "Enter" && !submitting && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            style={{ display: "none" }}
            accept={ACCEPTED_EXT.join(",")}
            onChange={e => addFiles(e.target.files)}
            disabled={submitting}
          />
          <div className="drop-zone__icon">📂</div>
          <p className="drop-zone__main">
            {dragOver ? "Drop files here" : "Drag & drop files, or click to browse"}
          </p>
          <p className="drop-zone__sub">
            Accepted: {ACCEPTED_EXT.join(", ")} · Max {MAX_FILE_SIZE_MB} MB per file
          </p>
          <p className="drop-zone__sub">
            Files will be zipped automatically before upload.
          </p>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <>
            <ul className="file-list">
              {files.map(entry => (
                <li
                  key={entry.id}
                  className={`file-item file-item--${entry.error ? "error" : entry.status}`}
                >
                  <span className="file-icon">{fileIcon(entry.file.name)}</span>
                  <div className="file-info">
                    <span className="file-name">{entry.file.name}</span>
                    <span className="file-size">{formatSize(entry.file.size)}</span>
                    {entry.error && <span className="file-error">{entry.error}</span>}
                  </div>
                  <span className="file-status">
                    {entry.error && "✕"}
                  </span>
                  {!submitting && (
                    <button
                      className="file-remove"
                      onClick={() => removeFile(entry.id)}
                      title="Remove"
                    >×</button>
                  )}
                </li>
              ))}
            </ul>

            {/* Total size indicator */}
            <div className={`portal-size-bar ${tooLarge ? "portal-size-bar--over" : ""}`}>
              <span>Total size: <strong>{totalMB} MB</strong> / {MAX_TOTAL_MB} MB</span>
              {tooLarge && <span className="size-warn">⚠ Total exceeds {MAX_TOTAL_MB} MB limit</span>}
            </div>
          </>
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

        {hasInvalid && (
          <div className="portal-warning">
            ⚠ Files with errors will be skipped. Remove or fix them before submitting.
          </div>
        )}

        {/* Progress message */}
        {submitting && progress && (
          <div className="portal-progress">
            <span className="spinner-dot" />
            <span>{progress}</span>
          </div>
        )}

        {/* Submit */}
        <button
          className="portal-submit"
          disabled={!hasValid || submitting}
          onClick={handleSubmit}
        >
          {submitting
            ? "Processing…"
            : `Zip & Submit ${validFiles.length} File(s) →`}
        </button>

        <Link to="/" className="auth-back">← Back to Home</Link>
      </div>
    </div>
  );
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function formatSize(bytes) {
  if (bytes < 1024)         return bytes + " B";
  if (bytes < 1024 * 1024)  return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function fileIcon(name) {
  const ext = name.split(".").pop().toLowerCase();
  const map  = { pdf:"📄", xlsx:"📊", xls:"📊", r:"📈", rmd:"📈", ipynb:"🐍", py:"🐍", csv:"📋", mtw:"📉", mtj:"📉" };
  return map[ext] || "📁";
}
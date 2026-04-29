// src/lib/supabase.js
// ─────────────────────────────────────────────────────────
//  Public Supabase client — anon key only.
//  The service key has been moved to /api/* server functions.
//
//  uploadFile() now sends the zip to /api/upload (serverless)
//  which does the actual storage write with the service key.
//
//  The only env vars here are VITE_ prefixed (anon key + URL).
//  These are intentionally public — Supabase designed them
//  to be exposed; your RLS policies are the real security.
// ─────────────────────────────────────────────────────────
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { storageKey: "public-supabase" },
});

export const BUCKET = "submissions";

// ── Upload via serverless function ─────────────────────────
// Converts zip to base64 and sends to /api/upload.
// The service key used for storage write stays on the server.
export async function uploadFile(zipFile, stage, teamName, teamId, notes) {
  // Read zip as base64
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(zipFile);
  });

  const res = await fetch("/api/upload", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileBase64: base64,
      fileName:   zipFile.name,
      fileType:   zipFile.type,
      teamId,
      teamName,
      stage,
      notes,
    }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Upload failed");

  // Return both storage path and saved DB record
  return { path: json.path, record: json.record };
}

// ── Check for existing submission ─────────────────────────
// Uses anon client — RLS allows anon SELECT (added in schema setup)
export async function getExistingSubmission(teamId, stage) {
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("team_id", teamId)
    .eq("stage", stage)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

// ── Delete old submission before resubmit ─────────────────
// Calls admin API (which has service key) to delete storage + row
// Requires admin password stored in sessionStorage if user is admin,
// OR you can make a separate /api/delete-submission endpoint.
// For now we use anon client to delete the row (allowed by RLS policy)
// and the upload API overwrites the file with upsert:true.
export async function deleteSubmissionRow(submissionId) {
  const { error } = await supabase
    .from("submissions")
    .delete()
    .eq("id", submissionId);
  if (error) throw new Error(error.message);
}
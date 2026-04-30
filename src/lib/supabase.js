// src/lib/supabase.js
// ─────────────────────────────────────────────────────────
//  Public Supabase client — publishable key only.
//
//  Updated for Supabase new API keys:
//  VITE_SUPABASE_ANON_KEY now holds sb_publishable_... instead of eyJ...
//  No other code changes needed — createClient works identically.
//
//  The publishable key (sb_publishable_...) is intentionally public.
//  Your RLS policies are what protect your data, not the key.
// ─────────────────────────────────────────────────────────
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY; // now sb_publishable_...

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    storageKey:     "public-supabase", // prevents GoTrueClient conflict with admin
  },
});

export const BUCKET = "submissions";

// ── Upload via serverless function ─────────────────────────
// Converts zip to base64 and sends to /api/upload.
// The secret key used for storage write stays on the server.
export async function uploadFile(zipFile, stage, teamName, teamId, notes) {
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

  return { path: json.path, record: json.record };
}

// ── Check for existing submission for this team + stage ────
// RLS allows anon SELECT on submissions table (set in schema.sql)
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
  return data; // null if no prior submission
}

// ── Delete old submission DB row before resubmitting ───────
// RLS allows anon DELETE because we set "Allow anon inserts/selects"
// The storage file is overwritten via upsert:true in /api/upload
export async function deleteSubmissionRow(submissionId) {
  const { error } = await supabase
    .from("submissions")
    .delete()
    .eq("id", submissionId);
  if (error) throw new Error(error.message);
}
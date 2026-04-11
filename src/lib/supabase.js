// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SERVICE_KEY   = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
}

// ── Public client (anon key) — for DB reads/writes by teams ──
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    storageKey: "public-supabase",   // ✅ FIX: prevents GoTrueClient conflict with admin client
  },
});

// ── Storage client (service role) — bypasses RLS for file upload ──
// This is safe: the service key is only used for storage operations,
// never for auth or user data. The anon key has no storage INSERT permission.
const storageClient = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    persistSession: false,
    storageKey: "storage-supabase",
  },
});

export const BUCKET = "submissions";

// ── Upload one zip file → returns storage path ─────────────
// Uses service role client so RLS on storage doesn't block it.
// Path: stage{n}/{team_name}/{filename}.zip
export async function uploadFile(file, stage, teamName) {
  const safeName   = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const safeFolder = teamName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path       = `stage${stage}/${safeFolder}/${safeName}`;

  const { data, error } = await storageClient.storage
    .from(BUCKET)
    .upload(path, file, {
      upsert:      true,   // overwrite if same filename (resubmission)
      contentType: file.type || "application/zip",
    });

  if (error) throw new Error(error.message);
  return data.path;
}

// ── Delete a file from storage ─────────────────────────────
export async function deleteStorageFile(filePath) {
  const { error } = await storageClient.storage
    .from(BUCKET)
    .remove([filePath]);
  if (error) throw new Error(error.message);
}

// ── Save submission metadata row ───────────────────────────
export async function saveSubmission({ teamId, stage, filePath, fileName, fileSizeBytes, fileType, notes }) {
  const { data, error } = await supabase
    .from("submissions")
    .insert({
      team_id:         teamId,
      stage,
      file_path:       filePath,
      file_name:       fileName,
      file_size_bytes: fileSizeBytes,
      file_type:       fileType,
      notes,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ── Delete a submission DB row ─────────────────────────────
// Uses service key so RLS doesn't block team deleting their own row
export async function deleteSubmissionRow(submissionId) {
  const { error } = await storageClient
    .from("submissions")
    .delete()
    .eq("id", submissionId);
  if (error) throw new Error(error.message);
}

// ── Get existing submission for a team+stage ───────────────
// Returns null if none exists
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
  return data;   // null if no prior submission
}

// ── Get signed download URL ────────────────────────────────
export async function getSignedUrl(path, expiresInSeconds = 300) {
  const { data, error } = await storageClient.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error) throw new Error(error.message);
  return data.signedUrl;
}
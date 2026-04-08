// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const BUCKET = "submissions";

// Upload one file → returns storage path
export async function uploadFile(file, stage, registrationNumber) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path     = `stage${stage}/${registrationNumber}/${safeName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      upsert:      false,
      contentType: file.type || "application/octet-stream",
    });

  if (error) throw new Error(error.message);
  return data.path;
}

// Get signed download URL (used by admin)
export async function getSignedUrl(path, expiresInSeconds = 300) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error) throw new Error(error.message);
  return data.signedUrl;
}

// Save submission metadata row
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

// Fetch all submissions for a team (used in portal to show history)
export async function getTeamSubmissions(teamId) {
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("team_id", teamId)
    .order("submitted_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}
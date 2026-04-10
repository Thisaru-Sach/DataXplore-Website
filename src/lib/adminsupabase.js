// src/lib/adminSupabase.js
// Uses the SERVICE ROLE key — bypasses RLS so admin sees all data.
// Only imported by pages under src/pages/admin/
// NEVER import this in public-facing components.
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL     = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

export const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
  auth: { persistSession: false },
});

export const BUCKET = "submissions";

// All teams with submission counts (uses the SQL view)
export async function getAllTeams() {
  const { data, error } = await adminSupabase
    .from("admin_submission_overview")
    .select("*");
  if (error) throw new Error(error.message);
  return data ?? [];
}

// All submissions, optionally filtered by stage
export async function getAllSubmissions(stage = null) {
  let query = adminSupabase
    .from("submissions")
    .select(`*, teams(team_name, registration_number, university, email)`)
    .order("submitted_at", { ascending: false });
  if (stage) query = query.eq("stage", stage);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

// 5-minute signed download URL for a storage file
export async function getDownloadUrl(filePath) {
  const { data, error } = await adminSupabase.storage
    .from(BUCKET)
    .createSignedUrl(filePath, 300);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

// Toggle stage eligibility for a team
export async function setEligibility(teamId, stage, value) {
  const field = stage === 3 ? "stage3_eligible" : "stage1_eligible";
  const { error } = await adminSupabase
    .from("teams")
    .update({ [field]: value })
    .eq("id", teamId);
  if (error) throw new Error(error.message);
}

// Delete a submission record and its storage file
export async function deleteSubmission(submissionId, filePath) {
  await adminSupabase.storage.from(BUCKET).remove([filePath]);
  const { error } = await adminSupabase
    .from("submissions")
    .delete()
    .eq("id", submissionId);
  if (error) throw new Error(error.message);
}
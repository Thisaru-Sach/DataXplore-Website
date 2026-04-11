// src/lib/adminsupabase.js
// Uses the SERVICE ROLE key — bypasses RLS so admin sees all data.
// Only imported by pages under src/pages/admin/
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL     = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

export const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
  auth: {
    persistSession: false,
    storageKey: "admin-supabase",    // ✅ FIX: unique key prevents GoTrueClient conflict
  },
});

export const BUCKET = "submissions";

// ── All teams from the admin overview view ─────────────────
export async function getAllTeams() {
  const { data, error } = await adminSupabase
    .from("admin_submission_overview")
    .select("*");
  if (error) throw new Error(error.message);
  return data ?? [];
}

// ── All submissions, optionally filtered by stage ──────────
// ✅ FIX: removed registration_number (no longer in schema)
export async function getAllSubmissions(stage = null) {
  let query = adminSupabase
    .from("submissions")
    .select(`
      *,
      teams (
        team_name,
        university,
        email,
        full_name,
        nic_number
      )
    `)
    .order("submitted_at", { ascending: false });
  if (stage) query = query.eq("stage", stage);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

// ── Single team — full record ──────────────────────────────
export async function getTeam(id) {
  const { data, error } = await adminSupabase
    .from("teams")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// ── Team submissions ───────────────────────────────────────
export async function getTeamSubmissions(teamId) {
  const { data, error } = await adminSupabase
    .from("submissions")
    .select("*")
    .eq("team_id", teamId)
    .order("submitted_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

// ── 5-minute signed download URL ──────────────────────────
export async function getDownloadUrl(filePath) {
  const { data, error } = await adminSupabase.storage
    .from(BUCKET)
    .createSignedUrl(filePath, 300);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

// ── Toggle stage eligibility ───────────────────────────────
export async function setEligibility(teamId, stage, value) {
  const field = stage === 3 ? "stage3_eligible" : "stage1_eligible";
  const { error } = await adminSupabase
    .from("teams")
    .update({ [field]: value })
    .eq("id", teamId);
  if (error) throw new Error(error.message);
}

// ── Delete submission: BOTH storage file AND DB row ────────
// ✅ FIX: previously only deleted storage, leaving a DB orphan row
export async function deleteSubmission(submissionId, filePath) {
  // 1. Remove file from storage
  const { error: storageErr } = await adminSupabase.storage
    .from(BUCKET)
    .remove([filePath]);
  if (storageErr) {
    // Log but don't throw — file may already be gone
    console.warn("Storage delete warning:", storageErr.message);
  }

  // 2. Delete the DB row — this must succeed
  const { error: dbErr } = await adminSupabase
    .from("submissions")
    .delete()
    .eq("id", submissionId);
  if (dbErr) throw new Error(dbErr.message);
}
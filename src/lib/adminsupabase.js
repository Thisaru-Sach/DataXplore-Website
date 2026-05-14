// src/lib/adminsupabase.js
// All admin calls go through /api/admin serverless function.
// Service key and admin password stay server-side only.

function getPass() {
  return sessionStorage.getItem("admin_password") ?? "";
}

async function api(action, payload = {}) {
  const res = await fetch("/api/admin", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      password: getPass(),
      action,
      payload,
    }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Admin API error");
  return json;
}

export async function getAllTeams() {
  const { data } = await api("get_teams");
  return data ?? [];
}

export async function getAllSubmissions(stage = null) {
  const { data } = await api("get_submissions", { stage });
  return data ?? [];
}

export async function getTeam(id) {
  const { data } = await api("get_team", { id });
  return data;
}

export async function getTeamSubmissions(teamId) {
  const { data } = await api("get_team_subs", { teamId });
  return data ?? [];
}

// ── Updated: pass the field name directly ─────────────────
// field: "stage1_eligible" | "stage3_eligible"
//      | "top5_eligible"   | "presentation_eligible"
export async function setEligibility(teamId, field, value) {
  await api("set_eligibility", { teamId, field, value });
}

export async function deleteSubmission(submissionId, filePath) {
  await api("delete_submission", { submissionId, filePath });
}

export async function getDownloadUrl(filePath) {
  const { url } = await api("get_download_url", { filePath });
  return url;
}

export async function insertTeam(team) {
  await api("insert_team", { team });
}
// src/lib/adminsupabase.js
// ─────────────────────────────────────────────────────────
//  Admin data access — all calls go through /api/admin.
//  The service key and admin password never reach the browser.
//
//  The admin password is sent with every request so the
//  server can re-validate it — sessionStorage only stores
//  it for UX (pre-filling), the server is the real gate.
// ─────────────────────────────────────────────────────────

// Get password from sessionStorage (set by AdminRoot on login)
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

// ── Public API ─────────────────────────────────────────────

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

export async function setEligibility(teamId, stage, value) {
  await api("set_eligibility", { teamId, stage, value });
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
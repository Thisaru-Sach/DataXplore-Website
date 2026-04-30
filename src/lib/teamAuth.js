// src/lib/teamAuth.js
// ─────────────────────────────────────────────────────────
//  Calls /api/auth (Vercel serverless function) instead of
//  Supabase Edge Function directly.
//  The service key never appears in this file or the browser.
// ─────────────────────────────────────────────────────────

export async function verifyTeam(nic, email) {
  const res = await fetch("/api/auth", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nic_number: nic.trim().toUpperCase(),
      email:      email.trim().toLowerCase(),
    }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || "Verification failed. Please check your details.");
  }

  return json.team;
}
// src/lib/teamAuth.js
// ─────────────────────────────────────────────────────────
//  Calls the Supabase Edge Function "team-auth" to verify
//  a team's registration number + email.
//
//  The Edge Function holds the service role key and does
//  the DB lookup — we never expose that key to the browser.
// ─────────────────────────────────────────────────────────

const EDGE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Verify a team by registration number + email.
 * Returns the team object on success.
 * Throws an Error with a user-friendly message on failure.
 */
export async function verifyTeam(nic, email) {
  const res = await fetch(
    `${EDGE_URL}/functions/v1/team-auth`,
    {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey":        ANON_KEY,
        "Authorization": `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({
        nic_number: nic.trim().toUpperCase(),
        email:               email.trim().toLowerCase(),
      }),
    }
  );

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || "Verification failed. Please check your details.");
  }

  return json.team;
}
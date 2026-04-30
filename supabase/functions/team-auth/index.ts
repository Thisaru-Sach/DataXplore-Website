// supabase/functions/team-auth/index.ts
// ─────────────────────────────────────────────────────────
//  Supabase Edge Function — Team Authentication
//
//  Updated for new Supabase API keys:
//  - Uses SECRET_KEY env var (manually set in Edge Function secrets)
//    instead of the auto-injected SUPABASE_SERVICE_ROLE_KEY which
//    still contains the old legacy JWT even after migration.
//
//  How to set the secret in Supabase dashboard:
//    Edge Functions → team-auth → Secrets → Add new secret
//    Name:  SECRET_KEY
//    Value: your sb_secret_... key
//
//  JWT verification must remain OFF for this function:
//    Edge Functions → team-auth → Details → Enforce JWT Verification: OFF
// ─────────────────────────────────────────────────────────
import { serve }        from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
// Use manually set SECRET_KEY — NOT SUPABASE_SERVICE_ROLE_KEY
// because the auto-injected var still holds the old legacy JWT key
// even after disabling legacy keys (known Supabase bug).
const SUPABASE_SERVICE = Deno.env.get("SECRET_KEY")!;

const cors = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  // CORS preflight — must return 200 with null body
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: cors });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    let body: { nic_number?: string; email?: string };
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const { nic_number, email } = body;

    if (!nic_number?.trim() || !email?.trim()) {
      return json({ error: "nic_number and email are required" }, 400);
    }

    // sb_secret_ key works identically to service_role in createClient
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);

    const { data: team, error: dbError } = await supabase
      .from("teams")
      .select(
        "id, nic_number, team_name, full_name, preferred_name, " +
        "university, faculty, email, contact_number, academic_year, " +
        "member_count, member1, member2, member3, member4, " +
        "stage1_eligible, stage3_eligible"
      )
      .eq("nic_number", nic_number.trim().toUpperCase())
      .eq("email", email.trim().toLowerCase())
      .single();

    if (dbError || !team) {
      return json(
        { error: "Team not found. Check your NIC number and email." },
        401
      );
    }

    return json({ team });

  } catch (err) {
    console.error("team-auth error:", err);
    return json({ error: "Internal server error" }, 500);
  }
});
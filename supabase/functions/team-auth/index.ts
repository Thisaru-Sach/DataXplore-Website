// supabase/functions/team-auth/index.ts

import { serve }        from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL     = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// ── CORS headers ───────────────────────────────────────────
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

  // ── CORS preflight — MUST return 200 with null body ──────
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: cors });
  }

  // ── Only allow POST ──────────────────────────────────────
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    // ── Parse body ───────────────────────────────────────
    let body: { registration_number?: string; email?: string };
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const { registration_number, email } = body;

    if (!registration_number?.trim() || !email?.trim()) {
      return json({ error: "registration_number and email are required" }, 400);
    }

    // ── DB lookup with service role (bypasses RLS) ───────
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);

    const { data: team, error: dbError } = await supabase
      .from("teams")
      .select(
        "id, team_name, university, email, phone, member_count, " +
        "registration_number, stage1_eligible, stage3_eligible, created_at"
      )
      .eq("registration_number", registration_number.trim().toUpperCase())
      .eq("email", email.trim().toLowerCase())
      .single();

    if (dbError || !team) {
      return json(
        { error: "Team not found. Check your registration number and email." },
        401
      );
    }

    return json({ team });

  } catch (err) {
    console.error("team-auth error:", err);
    return json({ error: "Internal server error" }, 500);
  }
});
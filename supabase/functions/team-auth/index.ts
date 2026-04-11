// supabase/functions/team-auth/index.ts
// Verifies a team by registration_number + email.
// Returns full team record so the portal has all data it needs.

import { serve }        from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL     = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: cors });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    let body: { nic_number?: string; email?: string };
    try { body = await req.json(); }
    catch { return json({ error: "Invalid JSON body" }, 400); }

    const { nic_number, email } = body;

    if (!nic_number?.trim() || !email?.trim()) {
      return json({ error: "nic_number and email are required" }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);

    // Select all fields the portal needs
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
        { error: "Team not found. Check your nic number and email." },
        401
      );
    }

    return json({ team });

  } catch (err) {
    console.error("team-auth error:", err);
    return json({ error: "Internal server error" }, 500);
  }
});
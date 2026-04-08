// supabase/functions/team-auth/index.ts
// ─────────────────────────────────────────────────────────
//  Supabase Edge Function — Team Authentication
//
//  Called by AuthGate.jsx with { registration_number, email }
//  Returns a signed JWT containing team_id so RLS policies work.
//
//  Deploy:
//    supabase functions deploy team-auth
//
//  This runs on Supabase's servers — the SERVICE ROLE KEY
//  is safe here and never exposed to the browser.
// ─────────────────────────────────────────────────────────
import { serve }         from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient }  from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL      = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { registration_number, email } = await req.json();

    if (!registration_number || !email) {
      return new Response(
        JSON.stringify({ error: "registration_number and email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role client — bypasses RLS for this lookup
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);

    // Look up team
    const { data: team, error } = await supabase
      .from("teams")
      .select("id, team_name, university, email, member_count, registration_number, stage1_eligible, stage3_eligible")
      .eq("registration_number", registration_number.trim().toUpperCase())
      .eq("email", email.trim().toLowerCase())
      .single();

    if (error || !team) {
      return new Response(
        JSON.stringify({ error: "Team not found. Check your registration number and email." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return team data — client will store this in state
    // The team_id is embedded so the frontend can pass it with requests
    return new Response(
      JSON.stringify({ team }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
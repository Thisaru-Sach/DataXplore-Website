// api/auth.js
// ─────────────────────────────────────────────────────────
//  Vercel Serverless Function — Team Authentication
//
//  Updated for Supabase new API keys:
//  SUPABASE_SERVICE_KEY now holds sb_secret_... instead of eyJ...
//  No other changes needed — createClient works identically.
// ─────────────────────────────────────────────────────────
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL     = process.env.SUPABASE_URL;
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_KEY; // sb_secret_...

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).json({ error: "Method not allowed" });

  const { nic_number, email } = req.body ?? {};

  if (!nic_number?.trim() || !email?.trim()) {
    return res.status(400).json({ error: "nic_number and email are required" });
  }

  // New sb_secret_ keys work identically to service_role in createClient
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
    auth: { persistSession: false },
  });

  const { data: team, error } = await supabase
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

  if (error || !team) {
    return res.status(401).json({
      error: "Team not found. Check your NIC number and email.",
    });
  }

  return res.status(200).json({ team });
}
// api/admin.js
// ─────────────────────────────────────────────────────────
//  Vercel Serverless Function — Admin Operations
//
//  Updated for Supabase new API keys:
//  SUPABASE_SERVICE_KEY now holds sb_secret_... instead of eyJ...
//  No other changes needed — createClient works identically.
//
//  Actions (passed as req.body.action):
//    get_teams          → all teams from admin_submission_overview
//    get_submissions    → all submissions (optional stage filter)
//    get_team           → single team by id
//    get_team_subs      → submissions for one team
//    set_eligibility    → toggle stage1/stage3_eligible
//    delete_submission  → remove storage file + DB row
//    get_download_url   → 5-min signed download URL
//    insert_team        → add a new team row
// ─────────────────────────────────────────────────────────
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL     = process.env.SUPABASE_URL;
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_KEY; // sb_secret_...
const ADMIN_PASSWORD   = process.env.ADMIN_PASSWORD;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).json({ error: "Method not allowed" });

  const { password, action, payload } = req.body ?? {};

  // ── Password check — every request must pass this ──────
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // New sb_secret_ keys work identically to service_role in createClient
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
    auth: { persistSession: false },
  });

  try {
    switch (action) {

      case "get_teams": {
        const { data, error } = await supabase
          .from("admin_submission_overview")
          .select("*");
        if (error) throw error;
        return res.status(200).json({ data });
      }

      case "get_submissions": {
        let query = supabase
          .from("submissions")
          .select("*, teams(team_name, university, email, full_name, nic_number)")
          .order("submitted_at", { ascending: false });
        if (payload?.stage) query = query.eq("stage", payload.stage);
        const { data, error } = await query;
        if (error) throw error;
        return res.status(200).json({ data });
      }

      case "get_team": {
        const { data, error } = await supabase
          .from("teams")
          .select("*")
          .eq("id", payload.id)
          .single();
        if (error) throw error;
        return res.status(200).json({ data });
      }

      case "get_team_subs": {
        const { data, error } = await supabase
          .from("submissions")
          .select("*")
          .eq("team_id", payload.teamId)
          .order("submitted_at", { ascending: false });
        if (error) throw error;
        return res.status(200).json({ data });
      }

      case "set_eligibility": {
        const field = payload.stage === 3 ? "stage3_eligible" : "stage1_eligible";
        const { error } = await supabase
          .from("teams")
          .update({ [field]: payload.value })
          .eq("id", payload.teamId);
        if (error) throw error;
        return res.status(200).json({ ok: true });
      }

      case "delete_submission": { 
        // Remove file from storage first
        await supabase.storage
          .from("submissions")
          .remove([payload.filePath]);
        // Then delete the DB row
        const { error } = await supabase
          .from("submissions")
          .delete()
          .eq("id", payload.submissionId);
        if (error) throw error;
        return res.status(200).json({ ok: true });
      }

      case "get_download_url": {
        const { data, error } = await supabase.storage
          .from("submissions")
          .createSignedUrl(payload.filePath, 300); // 5-minute URL
        if (error) throw error;
        return res.status(200).json({ url: data.signedUrl });
      }

      case "insert_team": {
        const { error } = await supabase
          .from("teams")
          .insert(payload.team);
        if (error) throw error;
        return res.status(200).json({ ok: true });
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
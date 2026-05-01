// api/admin.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL     = process.env.SUPABASE_URL;
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_KEY;
const ADMIN_PASSWORD   = process.env.ADMIN_PASSWORD;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).json({ error: "Method not allowed" });

  const { password, action, payload } = req.body ?? {};

  // ── Env var check — helps diagnose missing variables ──
  if (!SUPABASE_URL || !SUPABASE_SERVICE || !ADMIN_PASSWORD) {
    console.error("Missing env vars:", {
      hasUrl:      !!SUPABASE_URL,
      hasService:  !!SUPABASE_SERVICE,
      hasPassword: !!ADMIN_PASSWORD,
    });
    return res.status(500).json({ error: "Server misconfiguration — missing environment variables" });
  }

  // ── Password check ─────────────────────────────────────
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
    auth: { persistSession: false },
  });

  try {
    switch (action) {

      case "get_teams": {
        const { data, error } = await supabase
          .from("admin_submission_overview")
          .select("*");
        if (error) {
          console.error("get_teams error:", error);
          throw error;
        }
        return res.status(200).json({ data });
      }

      case "get_submissions": {
        let query = supabase
          .from("submissions")
          .select("*, teams(team_name, university, email, full_name, nic_number)")
          .order("submitted_at", { ascending: false });
        if (payload?.stage) query = query.eq("stage", payload.stage);
        const { data, error } = await query;
        if (error) { console.error("get_submissions error:", error); throw error; }
        return res.status(200).json({ data });
      }

      case "get_team": {
        const { data, error } = await supabase
          .from("teams")
          .select("*")
          .eq("id", payload.id)
          .single();
        if (error) { console.error("get_team error:", error); throw error; }
        return res.status(200).json({ data });
      }

      case "get_team_subs": {
        const { data, error } = await supabase
          .from("submissions")
          .select("*")
          .eq("team_id", payload.teamId)
          .order("submitted_at", { ascending: false });
        if (error) { console.error("get_team_subs error:", error); throw error; }
        return res.status(200).json({ data });
      }

      case "set_eligibility": {
        const field = payload.stage === 3 ? "stage3_eligible" : "stage1_eligible";
        const { error } = await supabase
          .from("teams")
          .update({ [field]: payload.value })
          .eq("id", payload.teamId);
        if (error) { console.error("set_eligibility error:", error); throw error; }
        return res.status(200).json({ ok: true });
      }

      case "delete_submission": {
        await supabase.storage.from("submissions").remove([payload.filePath]);
        const { error } = await supabase
          .from("submissions")
          .delete()
          .eq("id", payload.submissionId);
        if (error) { console.error("delete_submission error:", error); throw error; }
        return res.status(200).json({ ok: true });
      }

      case "get_download_url": {
        const { data, error } = await supabase.storage
          .from("submissions")
          .createSignedUrl(payload.filePath, 300);
        if (error) { console.error("get_download_url error:", error); throw error; }
        return res.status(200).json({ url: data.signedUrl });
      }

      case "insert_team": {
        const { error } = await supabase
          .from("teams")
          .insert(payload.team);
        if (error) { console.error("insert_team error:", error); throw error; }
        return res.status(200).json({ ok: true });
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }

  } catch (err) {
    console.error("api/admin unhandled error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
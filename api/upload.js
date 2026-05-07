// api/upload.js
// ─────────────────────────────────────────────────────────
//  Vercel Serverless Function — File Upload
//
//  Enforces ONE zip per team per stage:
//  Before uploading, checks if a file already exists at the
//  storage path and deletes it first. Also deletes the old
//  DB row so there is never more than one submission record
//  per team per stage.
//
//  Storage path: stage{n}/{team_name}/{team_name}_stage{n}_*.zip
// ─────────────────────────────────────────────────────────
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL     = process.env.SUPABASE_URL;
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_KEY;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "55mb",
    },
  },
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).json({ error: "Method not allowed" });

  const { fileBase64, fileName, fileType, teamId, teamName, stage, notes } = req.body ?? {};

  if (!fileBase64 || !fileName || !teamId || !teamName || !stage) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
    auth: { persistSession: false },
  });

  try {
    // ── Step 1: Check for and delete any existing submission ──
    // Find existing DB row for this team + stage
    const { data: existing } = await supabase
      .from("submissions")
      .select("id, file_path")
      .eq("team_id", teamId)
      .eq("stage", stage)
      .limit(1)
      .maybeSingle();

    if (existing) {
      // Delete the old storage file first
      console.log(`Deleting old storage file: ${existing.file_path}`);
      const { error: storageDelErr } = await supabase.storage
        .from("submissions")
        .remove([existing.file_path]);

      if (storageDelErr) {
        // Log but continue — the file may already be gone
        console.warn("Old storage file delete warning:", storageDelErr.message);
      }

      // Delete the old DB row
      const { error: dbDelErr } = await supabase
        .from("submissions")
        .delete()
        .eq("id", existing.id);

      if (dbDelErr) {
        console.error("Old DB row delete error:", dbDelErr.message);
        return res.status(500).json({ error: "Failed to remove previous submission: " + dbDelErr.message });
      }

      console.log(`Deleted previous submission ${existing.id} for team ${teamId} stage ${stage}`);
    }

    // ── Step 2: Upload new zip to storage ─────────────────
    const buffer = Buffer.from(fileBase64, "base64");
    const uint8  = new Uint8Array(buffer);

    const safeFolder  = teamName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const safeName    = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    // Path format: stage{n}/{team_name}/{filename}.zip
    const storagePath = `stage${stage}/${safeFolder}/${safeName}`;

    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from("submissions")
      .upload(storagePath, uint8, {
        upsert:      true,   // overwrite if somehow same filename exists
        contentType: fileType || "application/zip",
      });

    if (uploadErr) {
      console.error("Storage upload error:", uploadErr.message);
      return res.status(500).json({ error: uploadErr.message });
    }

    // ── Step 3: Save new metadata row ─────────────────────
    const { data: record, error: dbErr } = await supabase
      .from("submissions")
      .insert({
        team_id:         teamId,
        stage,
        file_path:       uploadData.path,
        file_name:       fileName,
        file_size_bytes: buffer.length,
        file_type:       "zip",
        notes:           notes || null,
      })
      .select()
      .single();

    if (dbErr) {
      console.error("DB insert error:", dbErr.message);
      return res.status(500).json({ error: dbErr.message });
    }

    return res.status(200).json({ path: uploadData.path, record });

  } catch (err) {
    console.error("api/upload unhandled error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
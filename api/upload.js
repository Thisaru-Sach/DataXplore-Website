// api/upload.js
// ─────────────────────────────────────────────────────────
//  Vercel Serverless Function — File Upload
//
//  Updated for Supabase new API keys:
//  SUPABASE_SERVICE_KEY now holds sb_secret_... instead of eyJ...
//  No other changes needed — createClient works identically.
// ─────────────────────────────────────────────────────────
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL     = process.env.SUPABASE_URL;
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_KEY; // sb_secret_...

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

  // New sb_secret_ keys work identically to service_role in createClient
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
    auth: { persistSession: false },
  });

  // Convert base64 → Buffer → Uint8Array for Supabase storage upload
  const buffer = Buffer.from(fileBase64, "base64");
  const uint8  = new Uint8Array(buffer);

  const safeFolder  = teamName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const safeName    = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `stage${stage}/${safeFolder}/${safeName}`;

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from("submissions")
    .upload(storagePath, uint8, {
      upsert:      true,
      contentType: fileType || "application/zip",
    });

  if (uploadErr) {
    return res.status(500).json({ error: uploadErr.message });
  }

  // Save metadata row to submissions table
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
    return res.status(500).json({ error: dbErr.message });
  }

  return res.status(200).json({ path: uploadData.path, record });
}
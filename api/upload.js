// api/upload.js
// ─────────────────────────────────────────────────────────
//  Vercel Serverless Function — File Upload
//
//  Receives the zip file as a base64 string plus metadata.
//  Uploads to Supabase Storage and saves DB row — all using
//  the SERVICE KEY which stays on the server.
//
//  Max payload: configure in vercel.json (default 4.5 MB —
//  increase to 50 MB for large zips, see vercel.json below).
// ─────────────────────────────────────────────────────────
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL     = process.env.SUPABASE_URL;
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_KEY;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "55mb",   // must be > your zip size limit
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

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);

  // Convert base64 → Buffer → Uint8Array for Supabase upload
  const buffer  = Buffer.from(fileBase64, "base64");
  const uint8   = new Uint8Array(buffer);

  const safeFolder = teamName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const safeName   = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `stage${stage}/${safeFolder}/${safeName}`;

  // Upload to storage
  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from("submissions")
    .upload(storagePath, uint8, {
      upsert:      true,
      contentType: fileType || "application/zip",
    });

  if (uploadErr) {
    return res.status(500).json({ error: uploadErr.message });
  }

  // Save metadata row
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
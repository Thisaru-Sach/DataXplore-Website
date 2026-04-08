-- ═══════════════════════════════════════════════════════════
--  DataXplore 2.0 — Supabase Database Schema
--  Run this entire file in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ── 1. Teams table ────────────────────────────────────────
--    Stores all registered teams.
--    Populated manually by admins from Tally registration data.
CREATE TABLE IF NOT EXISTS teams (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name           text NOT NULL,
  university          text NOT NULL,
  email               text UNIQUE NOT NULL,
  phone               text,
  member_count        int  CHECK (member_count BETWEEN 3 AND 4),
  registration_number text UNIQUE NOT NULL,
  stage1_eligible     boolean DEFAULT true,
  stage3_eligible     boolean DEFAULT false,
  created_at          timestamptz DEFAULT now()
);

-- ── 2. Submissions table ───────────────────────────────────
--    One row per uploaded file.
CREATE TABLE IF NOT EXISTS submissions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id         uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  stage           int  NOT NULL CHECK (stage IN (1, 3)),
  file_name       text NOT NULL,
  file_path       text NOT NULL,   -- path inside Supabase Storage bucket
  file_size_bytes bigint,
  file_type       text,            -- extension: pdf, r, rmd, ipynb, etc.
  notes           text,
  submitted_at    timestamptz DEFAULT now()
);

-- ── 3. Row Level Security (RLS) ────────────────────────────
--    Teams can only read/write their OWN rows.
--    We use a custom claim stored in JWT metadata (team_id).

ALTER TABLE teams       ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Teams: a row is accessible only if the JWT claim matches
CREATE POLICY "teams_own_row" ON teams
  FOR ALL
  USING (id::text = current_setting('request.jwt.claims', true)::json->>'team_id');

-- Submissions: a team can only see its own submissions
CREATE POLICY "submissions_own_rows" ON submissions
  FOR ALL
  USING (team_id::text = current_setting('request.jwt.claims', true)::json->>'team_id');

-- ── 4. Admin bypass ───────────────────────────────────────
--    Service role key bypasses RLS automatically.
--    Never expose the service role key in frontend code.

-- ── 5. Storage bucket ─────────────────────────────────────
--    Create this manually in: Storage → New Bucket
--    Name:    submissions
--    Public:  NO  (private — signed URLs required)
--
--    Then add this storage policy in: Storage → Policies
--    (or run via dashboard UI)

-- Allow authenticated teams to upload to their own folder
-- Bucket: submissions
-- Policy name: team_uploads
-- Allowed operations: INSERT, SELECT
-- Using expression:
--   (storage.foldername(name))[1] = (select registration_number from teams where id::text = current_setting('request.jwt.claims',true)::json->>'team_id')

-- ── 6. Helpful indexes ────────────────────────────────────
CREATE INDEX IF NOT EXISTS submissions_team_id_idx ON submissions(team_id);
CREATE INDEX IF NOT EXISTS submissions_stage_idx   ON submissions(stage);
CREATE INDEX IF NOT EXISTS teams_email_idx         ON teams(email);
CREATE INDEX IF NOT EXISTS teams_reg_idx           ON teams(registration_number);

-- ── 7. Admin view (convenience) ───────────────────────────
CREATE OR REPLACE VIEW admin_submission_overview AS
  SELECT
    t.team_name,
    t.registration_number,
    t.university,
    t.email,
    t.member_count,
    t.stage1_eligible,
    t.stage3_eligible,
    COUNT(s.id) FILTER (WHERE s.stage = 1) AS stage1_files,
    COUNT(s.id) FILTER (WHERE s.stage = 3) AS stage3_files,
    MAX(s.submitted_at)                     AS last_submission,
    t.created_at                            AS registered_at
  FROM teams t
  LEFT JOIN submissions s ON s.team_id = t.id
  GROUP BY t.id
  ORDER BY t.created_at DESC;
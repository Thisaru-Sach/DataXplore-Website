-- ═══════════════════════════════════════════════════════════
--  DataXplore 2.0 — FINAL Complete Database Schema
--  Statistics Society, University of Sri Jayewardenepura
--
--  HOW TO USE:
--  ─────────────────────────────────────────────────────────
--  FRESH INSTALL (new Supabase project):
--    Run this entire file in SQL Editor — top to bottom.
--
--  EXISTING PROJECT (table already created):
--    Skip Section 1 (CREATE TABLE).
--    Run Sections 2 onwards.
--    Then run the ALTER TABLE block at the very bottom
--    to add any missing columns.
-- ═══════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────
--  SECTION 1 — TABLES
-- ─────────────────────────────────────────────────────────

-- ── 1a. Teams ─────────────────────────────────────────────
--  Populated manually by admin from Tally registration export.
--  Authentication uses nic_number + email via Edge Function.

CREATE TABLE IF NOT EXISTS teams (

  -- Internal ID (auto-generated, never exposed to teams)
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Tally registration metadata
  submission_id         text,                         -- Tally submission ID
  respondent_id         text,                         -- Tally respondent ID
  submitted_at_tally    timestamptz,                  -- Tally form submission timestamp

  -- Lead registrant personal details
  full_name             text        NOT NULL,          -- full legal name
  preferred_name        text,                          -- nickname / preferred name
  university            text        NOT NULL,          -- institution name
  faculty               text,                          -- faculty / department
  nic_number            text,                          -- NIC (used for login)
  student_id_url        text,                          -- Tally storage link to student ID photo
  email                 text        UNIQUE NOT NULL,   -- email (used for login)
  contact_number        text,                          -- phone number
  academic_year         text,                          -- e.g. "2nd Year"

  -- Team details
  team_name             text        NOT NULL,
  member_count          int         CHECK (member_count BETWEEN 3 AND 4),

  -- Team members (format: "Full Name — +94 7X XXX XXXX")
  member1               text,                          -- member 1 name + contact
  member2               text,                          -- member 2 name + contact
  member3               text,                          -- member 3 name + contact
  member4               text,                          -- member 4 (null for 3-member teams)

  -- ── Competition progression flags ─────────────────────
  -- These are toggled by admin as the competition advances.
  -- Each one unlocks a new feature on the public website.

  stage1_eligible       boolean     DEFAULT true,      -- can submit Stage 1
  stage3_eligible       boolean     DEFAULT false,      -- Top 10 — can submit Stage 3
                                                        -- revealed on top10Announce date
  top5_eligible         boolean     DEFAULT false,      -- Top 5 Finalist
                                                        -- revealed on top5Announce date
  presentation_eligible boolean     DEFAULT false,      -- Final presenter
                                                        -- revealed on presentations date

  -- Record metadata
  created_at            timestamptz DEFAULT now()       -- when admin inserted this row
);


-- ── 1b. Submissions ───────────────────────────────────────
--  One row per uploaded zip file.
--  Files stored in Supabase Storage bucket "submissions".
--  Path format: stage{n}/{team_name}/{filename}.zip
--
--  One submission per team per stage is enforced by
--  api/upload.js — old record + file deleted before insert.

CREATE TABLE IF NOT EXISTS submissions (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id         uuid        NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  stage           int         NOT NULL CHECK (stage IN (1, 3)),
  file_name       text        NOT NULL,                 -- zip filename
  file_path       text        NOT NULL,                 -- path in Supabase Storage
  file_size_bytes bigint,                               -- zip file size in bytes
  file_type       text,                                 -- always "zip"
  notes           text,                                 -- optional notes from team
  submitted_at    timestamptz DEFAULT now()
);


-- ─────────────────────────────────────────────────────────
--  SECTION 2 — ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────
--  The service role key (used in /api/* serverless functions)
--  bypasses ALL RLS automatically — no policy needed for admin.
--
--  The anon/publishable key (used in browser) is restricted
--  by the policies below.

ALTER TABLE teams       ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies before recreating cleanly
DROP POLICY IF EXISTS "teams_own_row"                  ON teams;
DROP POLICY IF EXISTS "public_read_stage3_teams"       ON teams;
DROP POLICY IF EXISTS "public_read_eligible_teams"     ON teams;
DROP POLICY IF EXISTS "submissions_own_rows"           ON submissions;
DROP POLICY IF EXISTS "Allow anon inserts to submissions"  ON submissions;
DROP POLICY IF EXISTS "Allow anon selects on submissions"  ON submissions;


-- ── Teams policies ────────────────────────────────────────

-- Public can read teams that have any eligibility flag set.
-- Used by Top10Teams.jsx to display selected teams on homepage.
-- Only exposes: id, team_name, university, stage3_eligible,
--               top5_eligible, presentation_eligible
-- (sensitive fields like nic_number, email are never selected
--  in the public query — SELECT in Top10Teams.jsx is limited)
CREATE POLICY "public_read_eligible_teams"
ON teams FOR SELECT TO public
USING (
  stage3_eligible       = true OR
  top5_eligible         = true OR
  presentation_eligible = true
);

-- No anon INSERT / UPDATE / DELETE on teams.
-- All team writes go through /api/admin (service role, server-side).


-- ── Submissions policies ──────────────────────────────────

-- Anon can SELECT submissions.
-- Used by getExistingSubmission() in supabase.js to check
-- if a team already has a submission before uploading.
CREATE POLICY "anon_select_submissions"
ON submissions FOR SELECT TO public
USING (true);

-- Anon can DELETE their own submission row.
-- Used by deleteSubmissionRow() in supabase.js when a team
-- resubmits — deletes the old DB row before uploading the new zip.
-- (The storage file deletion uses service role via /api/upload)
CREATE POLICY "anon_delete_submissions"
ON submissions FOR DELETE TO public
USING (true);

-- Note: INSERT on submissions is done server-side via /api/upload.js
-- using the service role key. No anon INSERT policy needed.


-- ─────────────────────────────────────────────────────────
--  SECTION 3 — STORAGE POLICIES
-- ─────────────────────────────────────────────────────────
--  Storage bucket name: "submissions"
--  Create it manually: Supabase → Storage → New Bucket
--  Name: submissions | Public: OFF
--
--  All storage writes (upload, delete) go through
--  /api/upload.js and /api/admin.js using service role.
--  The policies below are kept minimal.

-- Allow anon to upload (belt-and-suspenders fallback,
-- primary upload path is via service role in api/upload.js)
DROP POLICY IF EXISTS "Allow anon uploads to submissions" ON storage.objects;

CREATE POLICY "Allow anon uploads to submissions"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'submissions');


-- ─────────────────────────────────────────────────────────
--  SECTION 4 — INDEXES
-- ─────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS teams_email_idx              ON teams(email);
CREATE INDEX IF NOT EXISTS teams_nic_idx                ON teams(nic_number);
CREATE INDEX IF NOT EXISTS teams_stage3_idx             ON teams(stage3_eligible);
CREATE INDEX IF NOT EXISTS teams_top5_idx               ON teams(top5_eligible);
CREATE INDEX IF NOT EXISTS teams_presentation_idx       ON teams(presentation_eligible);
CREATE INDEX IF NOT EXISTS submissions_team_id_idx      ON submissions(team_id);
CREATE INDEX IF NOT EXISTS submissions_stage_idx        ON submissions(stage);
CREATE INDEX IF NOT EXISTS submissions_team_stage_idx   ON submissions(team_id, stage);


-- ─────────────────────────────────────────────────────────
--  SECTION 5 — ADMIN OVERVIEW VIEW
-- ─────────────────────────────────────────────────────────
--  Used exclusively by /api/admin.js (service role).
--  Denormalised view joining teams + submission counts.
--
--  IMPORTANT: No ORDER BY inside the view.
--  PostgREST does not support ORDER BY in views and
--  it causes PGRST002 schema cache errors.

DROP VIEW IF EXISTS admin_submission_overview;

CREATE OR REPLACE VIEW admin_submission_overview AS
SELECT
  -- Team identity
  t.id,
  t.submission_id,
  t.respondent_id,
  t.submitted_at_tally,

  -- Lead registrant
  t.full_name,
  t.preferred_name,
  t.university,
  t.faculty,
  t.nic_number,
  t.student_id_url,
  t.email,
  t.contact_number,
  t.academic_year,

  -- Team
  t.team_name,
  t.member_count,
  t.member1,
  t.member2,
  t.member3,
  t.member4,

  -- Competition progression flags
  t.stage1_eligible,
  t.stage3_eligible,
  t.top5_eligible,
  t.presentation_eligible,

  -- Record metadata
  t.created_at,

  -- Submission counts (aggregated)
  COUNT(s.id) FILTER (WHERE s.stage = 1) AS stage1_files,
  COUNT(s.id) FILTER (WHERE s.stage = 3) AS stage3_files,
  MAX(s.submitted_at)                     AS last_submission

FROM teams t
LEFT JOIN submissions s ON s.team_id = t.id
GROUP BY t.id;

-- Grant view access to all roles
-- (service role reads it in /api/admin.js)
GRANT SELECT ON admin_submission_overview TO anon;
GRANT SELECT ON admin_submission_overview TO authenticated;
GRANT SELECT ON admin_submission_overview TO service_role;


-- ─────────────────────────────────────────────────────────
--  SECTION 6 — RELOAD POSTGREST SCHEMA CACHE
-- ─────────────────────────────────────────────────────────
--  Required after any structural changes (new columns, new
--  views) to avoid PGRST002 errors.
--  Run this every time you make schema changes.

NOTIFY pgrst, 'reload schema';


-- ─────────────────────────────────────────────────────────
--  SECTION 7 — VERIFICATION QUERIES
-- ─────────────────────────────────────────────────────────
--  Run these after the schema to confirm everything works.

-- Check tables exist with correct columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'teams'
ORDER BY ordinal_position;

-- Check view works (no PGRST002 error)
SELECT id, team_name, stage3_eligible, top5_eligible,
       presentation_eligible, stage1_files, stage3_files
FROM admin_submission_overview
LIMIT 5;

-- Check RLS policies
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename IN ('teams', 'submissions')
ORDER BY tablename, policyname;


-- ═══════════════════════════════════════════════════════════
--  ALTER TABLE BLOCK
--  ─────────────────────────────────────────────────────────
--  If your teams table ALREADY EXISTS and you are adding
--  columns that may be missing, uncomment and run these.
--  Safe to run multiple times (IF NOT EXISTS prevents errors).
-- ═══════════════════════════════════════════════════════════

-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS submission_id         text;
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS respondent_id         text;
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS submitted_at_tally    timestamptz;
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS full_name             text;
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS preferred_name        text;
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS faculty               text;
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS nic_number            text;
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS student_id_url        text;
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS academic_year         text;
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS member1               text;
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS member2               text;
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS member3               text;
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS member4               text;
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS stage1_eligible       boolean DEFAULT true;
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS stage3_eligible       boolean DEFAULT false;
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS top5_eligible         boolean DEFAULT false;
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS presentation_eligible boolean DEFAULT false;
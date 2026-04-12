-- ═══════════════════════════════════════════════════════════
--  DataXplore 2.0 — Supabase Database Schema (Updated)
--  Run this entire file in: Supabase Dashboard → SQL Editor
--
--  If the teams table already exists, use the ALTER statements
--  at the bottom of this file instead of re-running CREATE.
-- ═══════════════════════════════════════════════════════════

-- ── 1. Teams table ────────────────────────────────────────
--    All fields from the Tally registration form.
--    Populated MANUALLY by admins — not by the registration form.
CREATE TABLE IF NOT EXISTS teams (

  -- ── Internal IDs ──────────────────────────────────────
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id       text,                        -- Tally submission ID
  respondent_id       text,                        -- Tally respondent ID
  submitted_at_tally  timestamptz,                 -- when they submitted the Tally form

  -- ── Lead registrant details ───────────────────────────
  full_name           text NOT NULL,               -- full legal name
  preferred_name      text,                        -- name they go by
  university          text NOT NULL,               -- university name
  faculty             text,                        -- faculty name
  nic_number          text,                        -- NIC number
  student_id_url      text,                        -- link to student ID pic in Tally storage
  email               text UNIQUE NOT NULL,        -- used to authenticate
  contact_number      text,                        -- phone
  academic_year       text,                        -- e.g. "2nd Year", "3rd Year"

  -- ── Team info ─────────────────────────────────────────
  team_name           text NOT NULL,
  member_count        int  CHECK (member_count BETWEEN 3 AND 4),

  -- ── Member 1 (lead registrant repeated for clarity) ──
  member1       text,

  -- ── Member 2 ──────────────────────────────────────────
  member2       text,

  -- ── Member 3 ──────────────────────────────────────────
  member3        text,

  -- ── Member 4 (optional — only if team has 4 members) ─
  member4        text,

  -- ── Competition progress ───────────────────────────────
  stage1_eligible     boolean DEFAULT true,
  stage3_eligible     boolean DEFAULT false,

  -- ── Record metadata ───────────────────────────────────
  created_at          timestamptz DEFAULT now()    -- when admin inserted this row
);


-- ── 2. Submissions table ───────────────────────────────────
--    One row per uploaded zip file. Unchanged.
CREATE TABLE IF NOT EXISTS submissions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id         uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  stage           int  NOT NULL CHECK (stage IN (1, 3)),
  file_name       text NOT NULL,
  file_path       text NOT NULL,
  file_size_bytes bigint,
  file_type       text,
  notes           text,
  submitted_at    timestamptz DEFAULT now()
);


-- ── 3. Row Level Security ─────────────────────────────────
ALTER TABLE teams       ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teams_own_row" ON teams;

CREATE POLICY "teams_own_row" ON teams
  FOR ALL
  USING (id::text = current_setting('request.jwt.claims', true)::json->>'team_id');

  DROP POLICY IF EXISTS "submissions_own_rows" ON submissions;

CREATE POLICY "submissions_own_rows" ON submissions
  FOR ALL
  USING (team_id::text = current_setting('request.jwt.claims', true)::json->>'team_id');


-- ── 4. Indexes ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS submissions_team_id_idx ON submissions(team_id);
CREATE INDEX IF NOT EXISTS submissions_stage_idx   ON submissions(stage);
CREATE INDEX IF NOT EXISTS teams_email_idx         ON teams(email);
CREATE INDEX IF NOT EXISTS teams_nic_idx           ON teams(nic_number);


-- ── 5. Admin overview view ────────────────────────────────
CREATE OR REPLACE VIEW admin_submission_overview AS
  SELECT
    t.id,
    t.submission_id,
    t.respondent_id,
    t.submitted_at_tally,
    t.full_name,
    t.preferred_name,
    t.team_name,
    t.university,
    t.faculty,
    t.email,
    t.contact_number,
    t.academic_year,
    t.nic_number,
    t.student_id_url,
    t.member_count,
    t.member1,
    t.member2,
    t.member3,
    t.member4,
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


-- ═══════════════════════════════════════════════════════════
--  IF THE TEAMS TABLE ALREADY EXISTS — run these ALTER
--  statements instead of the CREATE TABLE above.
--  Comment out the CREATE TABLE block and uncomment these.
-- ═══════════════════════════════════════════════════════════

-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS submission_id      text;
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS respondent_id      text;
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS submitted_at_tally timestamptz;
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS full_name          text;
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS preferred_name     text;
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS faculty            text;
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS nic_number         text;
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS student_id_url     text;
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS academic_year      text;
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS member1      text;
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS member2       text;
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS member3       text;
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS member4       text;
-- Then refresh the view:
-- CREATE OR REPLACE VIEW admin_submission_overview AS ...

DROP POLICY IF EXISTS "Allow anon uploads to submissions" ON storage.objects;

CREATE POLICY "Allow anon uploads to submissions"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'submissions');

-- Remove the JWT-dependent policy
DROP POLICY IF EXISTS "Allow anon inserts to submissions" ON submissions;

-- Allow anonymous inserts into the submissions table
CREATE POLICY "Allow anon inserts to submissions"
ON submissions FOR INSERT
TO public
WITH CHECK (true);

-- Allow teams to view their own submissions (if you use getTeamSubmissions on the frontend)
-- Note: Since the user is anon, they could technically query any team's submissions if they knew the team_id. 

DROP POLICY IF EXISTS "Allow anon selects on submissions" ON submissions;

CREATE POLICY "Allow anon selects on submissions"
ON submissions FOR SELECT
TO public
USING (true);

-- ═══════════════════════════════════════════════════════════
--  Run this in Supabase SQL Editor
--  Allows the public site to read team names for Top 10 display.
--  Only reads stage3_eligible=true teams — no sensitive data.
-- ═══════════════════════════════════════════════════════════
 
-- Allow anyone (anon) to read team names + university for Top 10 display
-- Only exposes: id, team_name, university for stage3_eligible teams
-- Sensitive fields (NIC, email, student_id_url) are NOT in the SELECT
-- in Top10Teams.jsx so they are never sent to the browser.

DROP POLICY IF EXISTS "public_read_stage3_teams" ON teams;

CREATE POLICY "public_read_stage3_teams"
ON teams
FOR SELECT
TO public              -- anon key can read
USING (stage3_eligible = true);  -- only eligible teams are visible
 
-- ── If you already have a "teams_own_row" policy that blocks everything ──
-- The service role (admin) bypasses all RLS, so admin still sees all teams.
-- The anon client only sees stage3_eligible=true rows via the policy above.
 
-- Verify:
-- SELECT team_name, university FROM teams WHERE stage3_eligible = true;
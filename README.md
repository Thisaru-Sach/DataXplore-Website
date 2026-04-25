# DataXplore 2.0 — Inter-University Data Analytics Competition Website

Official website and submission portal for DataXplore 2.0, organised by the **Statistics Society, University of Sri Jayewardenepura**.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Supabase Setup](#supabase-setup)
- [Key Features](#key-features)
- [Date & Phase Configuration](#date--phase-configuration)
- [Admin Dashboard](#admin-dashboard)
- [Submission Portal](#submission-portal)
- [Deploying to Vercel](#deploying-to-vercel)
- [Adding Teams (CSV Import)](#adding-teams-csv-import)
- [Edge Function](#edge-function)
- [Known Gotchas](#known-gotchas)

---

## Overview

DataXplore 2.0 is a 4-stage inter-university data analytics competition. This repository contains:

- A **public-facing React website** (landing page, timeline, guidelines, submission portal)
- A **password-protected admin dashboard** embedded at `/admin`
- A **Supabase Edge Function** for team authentication
- **Supabase** for the database, storage, and serverless backend

No Express server. Everything runs either in the browser or on Supabase's infrastructure.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| Styling | Plain CSS with CSS variables |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Edge Function (NIC + email lookup) |
| File Storage | Supabase Storage |
| File Zipping | JSZip (client-side, in browser) |
| Deployment | Vercel |
| Registration Form | Tally (external) |

---

## Project Structure

```
dataxplore-website/
│
├── public/                         # Static assets
│
├── src/
│   ├── assets/                     # Logos, images
│   │
│   ├── components/
│   │   ├── Canvas.jsx              # Animated star-constellation background
│   │   ├── Navbar.jsx              # Responsive navbar with mobile drawer
│   │   ├── Hero.jsx                # Hero section (date-aware register button)
│   │   ├── About.jsx
│   │   ├── Timeline.jsx            # Key dates — auto-marks past/today/future
│   │   ├── Top10Teams.jsx          # Selected teams — visible from top10Announce date
│   │   ├── Structure.jsx           # Competition stages + speaker popup (Stage 2)
│   │   ├── Guidelines.jsx          # Tabbed rules section
│   │   ├── Organizers.jsx
│   │   ├── RegCTA.jsx              # Registration CTA (phase-aware)
│   │   ├── Footer.jsx
│   │   │
│   │   └── submission/
│   │       ├── AuthGate.jsx        # NIC + email login form + dataset Drive link
│   │       ├── AuthGate.css
│   │       ├── SubmissionBanner.jsx # Phase-status bar on homepage
│   │       ├── SubmissionBanner.css
│   │       ├── SubmissionPortal.jsx # File upload + zip + Supabase upload
│   │       └── SubmissionPortal.css
│   │
│   ├── config/
│   │   └── dates.js                # ALL competition dates live here
│   │
│   ├── lib/
│   │   ├── supabase.js             # Anon client + storage helpers
│   │   ├── adminSupabase.js        # Service-role client (admin only)
│   │   └── teamAuth.js             # Calls Edge Function to verify team
│   │
│   ├── pages/
│   │   ├── Home.jsx                # Landing page
│   │   ├── Submit.jsx              # /submit route (phase-gated)
│   │   │
│   │   └── admin/
│   │       ├── AdminRoot.jsx       # Password gate + sidebar layout
│   │       ├── Admin.css           # All admin styles (adm- prefix)
│   │       ├── Dashboard.jsx       # Teams table + Add Team modal
│   │       ├── Submissions.jsx     # All uploads with download/delete
│   │       └── TeamDetail.jsx      # Per-team detail + eligibility toggle
│   │
│   ├── App.jsx                     # React Router routes
│   └── main.jsx
│
├── supabase/
│   ├── schema.sql                  # Run once in Supabase SQL Editor
│   ├── config.toml                 # Supabase CLI config (optional)
│   └── functions/
│       └── team-auth/
│           └── index.ts            # Edge Function — NIC + email verification
│
├── .env                            # Local env vars (never commit)
├── .env.example                    # Template
├── vercel.json                     # SPA rewrite rule
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account and project

### Install dependencies

```bash
npm install
```

Required packages:

```bash
npm install @supabase/supabase-js jszip react-router-dom
```

### Run locally

```bash
npm run dev
```

The site runs at `http://localhost:5173`.

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Supabase project URL — Settings → API → Project URL
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co

# Anon/public key — safe to use in frontend
# Settings → API → anon public
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1N...

# Service role key — bypasses RLS, admin only
# Settings → API → service_role secret
# Never expose this in public components — only used in adminSupabase.js
VITE_SUPABASE_SERVICE_KEY=eyJhbGciOi...

# Admin dashboard password
VITE_ADMIN_PASSWORD=your_strong_password_here
```

Add the same four variables to **Vercel → Settings → Environment Variables** before deploying.

---

## Supabase Setup

### 1. Run the database schema

Supabase → **SQL Editor** → run the entire contents of `supabase/schema.sql`.

This creates:

| Object | Purpose |
|---|---|
| `teams` table | All registered teams (manually entered by admin) |
| `submissions` table | One row per uploaded zip file |
| RLS policies | Security — service role bypasses automatically |
| `admin_submission_overview` | Denormalised view used by admin dashboard |
| Indexes | On `email`, `nic_number`, `team_id`, `stage` |

### 2. Create the Storage bucket

1. Supabase → **Storage** → **New Bucket**
2. Name: `submissions`  
3. Public: **OFF** (files need signed URLs to download)

Then in **Storage → Policies**:

```sql
-- Allow uploads from the portal
CREATE POLICY "Allow anon uploads to submissions"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'submissions');
```

### 3. Allow public read for Top 10 Teams

```sql
CREATE POLICY "public_read_stage3_teams"
ON teams FOR SELECT TO public
USING (stage3_eligible = true);
```

### 4. Allow submission table inserts and reads

```sql
CREATE POLICY "Allow anon inserts to submissions"
ON submissions FOR INSERT TO public
WITH CHECK (true);

CREATE POLICY "Allow anon selects on submissions"
ON submissions FOR SELECT TO public
USING (true);
```

### 5. Deploy the Edge Function

**Via Supabase dashboard (no CLI needed):**
1. Supabase → **Edge Functions** → **Create a new function**
2. Name it exactly: `team-auth`
3. Paste `supabase/functions/team-auth/index.ts`
4. Click **Deploy**
5. Edge Functions → `team-auth` → **Details** tab → turn off **Enforce JWT Verification**

**Via Supabase CLI:**
```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy team-auth
```

---

## Key Features

### Phase-aware UI

Every date-sensitive component reads from `src/config/dates.js`. The site changes what it shows automatically based on the current competition phase — no code changes needed between phases.

| Phase | What changes on the site |
|---|---|
| `before_reg` | Register button disabled, banner says "Coming Soon" |
| `reg_open` | Register button active, banner links to Tally form |
| `reg_closed` | Register button disabled, portal locked |
| `stage1_open` | Submission portal open, banner links to `/submit` |
| `stage1_closed` | Portal locked, top 10 announcement date shown |
| `stage3_open` | Portal open again for Stage 3 eligible teams only |
| `stage3_closed` | Everything locked, winners date shown |

### Top 10 Teams section

`Top10Teams.jsx` appears on the homepage automatically on/after `DATES.top10Announce`. Queries `teams` where `stage3_eligible = true`. Hidden before that date — returns `null` and takes up no space.

To reveal a team: Admin Dashboard → Teams → toggle **S3 Eligible** to ✓ Yes.

### Speaker popup (Stage 2 card)

`Structure.jsx` Stage 2 card has a **"View Resource Persons"** button. On desktop, hovering the card or clicking the button opens a popup to the right. On mobile (≤900px) it becomes a bottom sheet with a backdrop overlay.

Edit speakers in the `RESOURCE_PERSONS` array at the top of `Structure.jsx`:

```js
const RESOURCE_PERSONS = [
  {
    name:   "Dr. Amara Perera",
    title:  "Senior Data Scientist",
    org:    "Dialog Axiata PLC",
    bio:    "Bio text here...",
    avatar: "",  // image URL, or leave empty for initials
  },
];
```

### Dataset Google Drive link

`AuthGate.jsx` shows a dataset download box above the login form. Set the URL at the top of the file:

```js
const DATASET_DRIVE_URL = "https://drive.google.com/drive/folders/YOUR_FOLDER_ID";
```

### One submission per team per stage

`SubmissionPortal.jsx` checks for an existing submission before uploading. If one is found, a warning banner shows the previous filename and timestamp. A confirmation dialog informs the user their previous submission will be permanently deleted before the new one is uploaded.

---

## Date & Phase Configuration

**All dates live in one file: `src/config/dates.js`**

```js
export const BYPASS_DATE_CHECK = true;  // set false before going live

export const DATES = {
  registrationOpen:  new Date("2026-03-28T00:00:00"),
  registrationClose: new Date("2026-04-08T23:59:59"),
  helpDeskSession:   new Date("2026-04-04T15:00:00"),  // pre-workshop help desk, 3 pm
  stage1Open:        new Date("2026-04-08T00:00:00"),
  stage1Close:       new Date("2026-04-24T12:00:00"),  // noon
  workshopDate:      new Date("2026-05-03T13:00:00"),  // 1 pm
  top10Announce:     new Date("2026-05-04T00:00:00"),
  stage3Open:        new Date("2026-05-04T00:00:00"),
  stage3Close:       new Date("2026-05-10T23:59:59"),
  top5Announce:      new Date("2026-05-13T00:00:00"),
  presentations:     new Date("2026-05-17T00:00:00"),
  winnersAnnounce:   new Date("2026-05-23T00:00:00"),
  statDay:           new Date("2026-06-04T00:00:00"),
};
```

`fmt(date, style)` formats any date for display:

| Style | Output example |
|---|---|
| `"short"` | `"28 Mar"` |
| `"full"` | `"28 Mar 2026"` |
| `"long"` | `"28th March 2026"` |
| `"time"` | `"3:00 pm"` |

---

## Admin Dashboard

Accessible at `/admin`. Protected by the `VITE_ADMIN_PASSWORD` environment variable. Session is stored in `sessionStorage` and clears when the browser is closed.

| URL | Page |
|---|---|
| `/admin` | Teams table with stats, search, eligibility toggles |
| `/admin/teams/:id` | Full team detail — all fields, members, submissions |
| `/admin/submissions` | All uploaded files — filter by stage, download, delete |

### Adding a team manually

Click **+ Add Team**. The modal has sections for:
- Tally metadata (Submission ID, Respondent ID, submitted date)
- Lead registrant (full name, NIC, university, faculty, email, contact, academic year, student ID URL)
- Team name and member count
- Members 1–4 (combined format: `Full Name — +94 7X XXX XXXX`)
- Stage eligibility checkboxes

### Granting Stage 3 eligibility

Toggle the **S3 Eligible** button on any team row. This immediately shows that team in the Top 10 section on the public homepage and unlocks Stage 3 submissions for them.

### Downloading submissions

Click **⬇ Download** — generates a 5-minute signed URL and triggers a browser download of the zip.

### Deleting submissions

Click **🗑** — deletes both the storage file **and** the database row in one action.

---

## Submission Portal

Teams access `/submit` during open submission windows.

**Upload flow:**
1. Phase check — shows a friendly closed screen if portal is not open
2. **AuthGate** — team leader enters NIC number + email
3. Edge Function verifies credentials against the `teams` table
4. Dataset Google Drive link shown above the form
5. **SubmissionPortal** — drag & drop or browse files
6. On submit: JSZip compresses all files client-side into one zip
7. Zip uploaded to Supabase Storage: `stage{n}/{team_name}/{filename}.zip`
8. Metadata row saved to `submissions` table
9. Success screen shown with submission timestamp

**Accepted file types:** `.pdf` `.xls` `.xlsx` `.R` `.r` `.rmd` `.Rmd` `.ipynb` `.py` `.csv` `.mtw` `.mtj` `.txt`

**Size limits:** 50 MB per individual file, 50 MB total per submission

---

## Deploying to Vercel

1. Push the repo to GitHub
2. Vercel → **New Project** → import repo
3. Framework preset: **Vite**
4. Add all four env vars in **Settings → Environment Variables**
5. Deploy

The `vercel.json` handles React Router's client-side routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

After changing env vars, redeploy: **Deployments → ⋯ → Redeploy**.

---

## Adding Teams (CSV Import)

Teams register via Tally. Export from Tally and import into Supabase.

### Tally export issues to fix before importing

| Problem | Fix |
|---|---|
| NIC numbers show as `2.00E+11` | Excel converts long numbers to scientific notation — export as `.xlsx`, format NIC column as **Text**, then save as CSV |
| Header has trailing space `"member3 "` | Strip the space — header must be exactly `member3` |
| `"null"` string in `member4` | Replace with empty string for 3-member teams |
| Dates in `M/D/YYYY HH:MM` format | Convert to ISO 8601 `YYYY-MM-DDTHH:MM:SS` |
| Windows `\r\n` line endings | Convert to Unix `\n` |

### CSV column order for import

```
submission_id, respondent_id, submitted_at_tally, full_name, preferred_name,
university, faculty, nic_number, student_id_url, email, contact_number,
academic_year, team_name, member_count, member1, member2, member3, member4,
stage1_eligible, stage3_eligible
```

Do not include `id` — Supabase generates it automatically.

**Import:** Supabase → Table Editor → `teams` → **Import data from CSV**

---

## Edge Function

File: `supabase/functions/team-auth/index.ts`

Called by `AuthGate.jsx` with `{ nic_number, email }`.

- Uses the service role key server-side — never exposed to the browser
- Matches `nic_number` (uppercased) + `email` (lowercased) against the `teams` table
- Returns the full team object on success (`200`)
- Returns `{ error: "Team not found..." }` on failure (`401`)
- CORS `OPTIONS` preflight returns `200` with `null` body (required for browser fetch)
- **JWT verification must be disabled** in the Supabase dashboard for this function

---

## Known Gotchas

**Multiple GoTrueClient warning**  
Both `supabase.js` and `adminSupabase.js` load in the same browser when an admin visits the site. Each uses a unique `storageKey` to prevent localStorage conflicts (`"public-supabase"` and `"admin-supabase"`).

**Storage 401 on file upload**  
The anon Supabase client cannot write to Storage due to RLS. `supabase.js` uses a separate `storageClient` initialised with the service role key, used only for file upload — not for reading any user data.

**File case sensitivity on Vercel**  
Vercel builds on Linux (case-sensitive). `Authgate.jsx` and `authgate.jsx` are different files. If a rename looks correct on Windows but Vercel still fails, use `git mv OldName.jsx NewName.jsx` to force git to track the case change.

**NIC numbers mangled by Excel**  
Once Excel converts a number to scientific notation (`2.00E+11`) the original digits are gone. Always set the NIC column format to **Text** in Excel before saving as CSV, or copy directly from Tally's online export.

**BYPASS_DATE_CHECK must be false in production**  
While `true`, the submission portal is always accessible regardless of dates, and a yellow testing banner is shown on the homepage. Set it to `false` in `src/config/dates.js` before the site goes live.
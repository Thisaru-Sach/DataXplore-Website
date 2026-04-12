// src/config/dates.js
// ─────────────────────────────────────────────────────────
//  Single source of truth for ALL competition dates.
//  Edit dates here — every component updates automatically.
//
//  TESTING FLAG:
//  BYPASS_DATE_CHECK = true  →  skips all deadline gates,
//  shows a "Testing Mode" banner, enables Skip Login button.
//  Set to false before going live.
// ─────────────────────────────────────────────────────────

export const BYPASS_DATE_CHECK = false; //  flip to false for production

export const DATES = {
  registrationOpen:  new Date("2026-03-28T00:00:00"),
  registrationClose: new Date("2026-04-08T11:59:59"),

  stage1Open:        new Date("2026-04-08T00:00:00"),
  stage1Close:       new Date("2026-04-24T23:59:00"),  // noon deadline

  helpDeskSession:   new Date("2026-04-23T15:00:00"),  // 4th Apr, 3:00 pm
  workshopDate:      new Date("2026-04-25T08:00:00"),  // 8am start
  top10Announce:     new Date("2026-05-04T00:00:00"),

  stage3Open:        new Date("2026-05-04T00:00:00"),
  stage3Close:       new Date("2026-05-10T23:59:59"),

  top5Announce:      new Date("2026-05-13T00:00:00"),
  presentations:     new Date("2026-05-17T00:00:00"),
  winnersAnnounce:   new Date("2026-05-23T00:00:00"),
  statDay:           new Date("2026-06-04T00:00:00"),
};

// ─────────────────────────────────────────────────────────
//  fmt(date, style)
//  Formats a Date object to a readable string.
//
//  style "short" → "28 Mar"          (used in Hero stats bar)
//  style "full"  → "28 Mar 2026"     (used in Timeline)
//  style "long"  → "28th March 2026" (used in Guidelines/Structure)
//  style "time"  → "3:00 pm"         (used for session times)
// ─────────────────────────────────────────────────────────
export function fmt(date, style = "full") {
  if (!(date instanceof Date) || isNaN(date)) return "TBA";

  if (style === "short") {
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }

  if (style === "full") {
    return date.toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
  }

  if (style === "long") {
    // e.g. "28th April 2026"
    const day   = date.getDate();
    const month = date.toLocaleDateString("en-GB", { month: "long" });
    const year  = date.getFullYear();
    return `${day}${ordinal(day)} ${month} ${year}`;
  }

  if (style === "time") {
    // e.g. "3:00 pm"
    return date.toLocaleTimeString("en-GB", {
      hour: "numeric", minute: "2-digit", hour12: true,
    });
  }
  
  return date.toDateString();
}

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

// ─────────────────────────────────────────────────────────
//  getPhase()
//  Returns a string describing the current competition phase.
//
//  "bypass"         BYPASS_DATE_CHECK is true
//  "before_reg"     before registration opens
//  "reg_open"       registration window active
//  "reg_closed"     registration ended, stage 1 not open
//  "stage1_open"    stage 1 submission active
//  "stage1_closed"  stage 1 ended, waiting for top-10
//  "stage3_open"    stage 3 submission active
//  "stage3_closed"  everything done
// ─────────────────────────────────────────────────────────
export function getPhase() {
  if (BYPASS_DATE_CHECK) return "bypass";

  const now = new Date();

  if (now < DATES.registrationOpen)   return "before_reg";
  if (now <= DATES.registrationClose) return "reg_open";
  if (now < DATES.stage1Open)         return "reg_closed";
  if (now <= DATES.stage1Close)       return "stage1_open";
  if (now < DATES.stage3Open)         return "stage1_closed";
  if (now <= DATES.stage3Close)       return "stage3_open";
  return "stage3_closed";
}

// Human-readable labels for each phase (used in SubmissionBanner)
export const PHASE_LABELS = {
  bypass:        "Testing Mode — All portals accessible",
  before_reg:    "Registration has not opened yet",
  reg_open:      "Registration is open",
  reg_closed:    "Registration closed — submissions opening soon",
  stage1_open:   "Stage 1 Submission Open",
  stage1_closed: "Stage 1 Submissions Closed — awaiting Top 10 announcement",
  stage3_open:   "Stage 3 Submission Open",
  stage3_closed: "Competition submissions have closed",
};
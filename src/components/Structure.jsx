import React, { useState, useRef } from "react";
import "./Structure.css";
import { DATES, fmt, getPhase } from "../config/dates";

const RESOURCE_PERSONS = [
  {
    name: "Dr. Thiyanga Thalagala",
    title: "Senior Lecturer",
    org: "USJP",
    bio: "Research experience in AI, data analysis.",
    avatar: "", // leave empty for initials fallback
  },
];

function Structure() {
  const [popupOpen, setPopupOpen] = useState(false);
  const hoverTimeout = useRef(null);

  // Desktop: open on mouse-enter, close on mouse-leave with small delay
  function onMouseEnter() {
    clearTimeout(hoverTimeout.current);
    setPopupOpen(true);
  }
  function onMouseLeave() {
    hoverTimeout.current = setTimeout(() => setPopupOpen(false), 220);
  }
  // Popup itself: keep open when hovering over it
  function onPopupEnter() {
    clearTimeout(hoverTimeout.current);
  }
  function onPopupLeave() {
    hoverTimeout.current = setTimeout(() => setPopupOpen(false), 220);
  }

  // Mobile: toggle on button click
  function togglePopup(e) {
    e.stopPropagation();
    setPopupOpen((p) => !p);
  }

  // Close if user clicks outside
  function onOverlayClick() {
    setPopupOpen(false);
  }

  const now = new Date();
  const phase = getPhase();

  function stageStatus(openDate, closeDate) {
    if (now < openDate) return "upcoming";
    if (now > closeDate) return "closed";
    return "open";
  }

  const s1Status = stageStatus(DATES.stage1Open, DATES.stage1Close);
  const s2Status = stageStatus(DATES.stage1Close, DATES.workshopDate); // workshop window
  const s3Status = stageStatus(DATES.stage3Open, DATES.stage3Close);
  const s4Status = stageStatus(DATES.top5Announce, DATES.statDay);

  // Maps status → small badge label
  const statusLabel = {
    open: "🟢 Open",
    upcoming: "⏳ Upcoming",
    closed: "✅ Closed",
  };

  return (
    <>
      <div className="sec-divider" id="sec-structure"></div>
      <div className="sec-wrap reveal">
        <h2 className="sec-title">
          Competition <span>Stages</span>
        </h2>
        <div className="stages-wrap">
          <div className="stage">
            <div className="stage-badge">
              Preliminary · Stage 1
              <span className={`stage-status stage-status--${s1Status}`}>
                {statusLabel[s1Status]}
              </span>
            </div>
            <h3>Data Analysis & Report</h3>
            <ul>
              <li>
                Analyze an ethically sourced dataset of{" "}
                <strong>500–5,000 records</strong>.
              </li>
              <li>
                Submit a folder including a pdf report, dataset and analysis
                scripts.
              </li>
              <li>
                Tools: Minitab, R, SPSS, Python, or other analytical platforms.
              </li>
              <li>
                Deadline:{" "}
                <strong>
                  {fmt(DATES.stage1Close, "long")} before 12:00 noon
                </strong>
                .
              </li>
            </ul>
          </div>

          <div className="stage">
            <div className="stage-badge">
              Preliminary · Stage 2
              <span className={`stage-status stage-status--${s2Status}`}>
                {statusLabel[s2Status]}
              </span>
            </div>
            <h3>Online Dashboard Workshop and Help Desk Session</h3>
            <ul>
              <li>
                Dashboard Workshop is <strong>Mandatory</strong> session for all
                registered teams.
              </li>
              <li>Delivered by industry and academic experts.</li>
              <li>Focuses on professional dashboard creation and standards.</li>
              <li>
                Held on <strong>{fmt(DATES.workshopDate, "long")}</strong>
              </li>
            </ul>

            {/* ── Help Desk Session notice ── */}
            <div className="stage-helpdesk">
              <span className="stage-helpdesk__icon">🛠️</span>
              <div>
                <span className="stage-helpdesk__label">
                  Pre-Workshop Help Desk Session
                </span>
                <p className="stage-helpdesk__text">
                  An online help desk session will be held on{" "}
                  <strong>{fmt(DATES.helpDeskSession, "long")}</strong> at{" "}
                  <strong>{fmt(DATES.helpDeskSession, "time")}</strong> to
                  ensure all participants are equipped with the necessary
                  software and installations required for the analysis prior to
                  the workshop.
                </p>
              </div>
            </div>
            {/* Speaker popup trigger button */}
            <button
              className="stage-speaker-btn"
              onClick={togglePopup}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              aria-expanded={popupOpen}
              aria-label="View resource persons"
            >
              👤 View Resource Persons
            </button>

            {/* ── Speaker popup (desktop: positioned; mobile: fixed overlay) ── */}
            {popupOpen && (
              <>
                {/* Mobile overlay backdrop */}
                <div
                  className="speaker-backdrop"
                  onClick={onOverlayClick}
                  aria-hidden="true"
                />
                <div
                  className="speaker-popup"
                  onMouseEnter={onPopupEnter}
                  onMouseLeave={onPopupLeave}
                  role="dialog"
                  aria-label="Resource Persons"
                >
                  <div className="speaker-popup__header">
                    <span className="speaker-popup__label">
                      Resource Persons
                    </span>
                    <button
                      className="speaker-popup__close"
                      onClick={() => setPopupOpen(false)}
                      aria-label="Close"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="speaker-popup__list">
                    {RESOURCE_PERSONS.map((p, i) => (
                      <div key={i} className="speaker-card">
                        <div className="speaker-info">
                          <div className="speaker-name">{p.name}</div>
                          <div className="speaker-title">{p.title}</div>
                          <div className="speaker-org">{p.org}</div>
                          <p className="speaker-bio">{p.bio}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="stage">
            <div className="stage-badge">
              Intermediate · Stage 3
              <span className={`stage-status stage-status--${s3Status}`}>
                {statusLabel[s3Status]}
              </span>
            </div>
            <h3>Dashboard Competition & Final Presentation</h3>
            <ul>
              <li>
                <strong>Physical round</strong> at the Blended Learning Center
                (BLC), USJ.
              </li>
              <li>
                Transform a new dataset into an{" "}
                <strong>interactive dashboard</strong>.
              </li>
              <li>
                <strong>Open-book:</strong> Participants are allowed to refer
                any external resource.
              </li>
              <li>
                Held on <strong>{fmt(DATES.stage3Close, "long")}</strong>; Top 5
                teams reach the finals.
              </li>
              <li>
                Final presenations on <strong>17th May 2026</strong>.
              </li>
            </ul>
          </div>

          <div className="stage">
            <div className="stage-badge">
              Final · Stage 4
              <span className={`stage-status stage-status--${s4Status}`}>
                {statusLabel[s4Status]}
              </span>
            </div>
            <h3>Stat Day & Award Ceremony</h3>
            <ul>
              <li>
                Demonstrate methodology, design choices, and{" "}
                <strong>data storytelling</strong>.
              </li>
              <li>
                Winners recognized at{" "}
                <strong>
                  Stat Day & Award Ceremony {fmt(DATES.statDay, "long")}
                </strong>
                .
              </li>
              <li>
                Prizes
                <br />
                <table>
                  <tbody>
                    <tr>
                      <td className="prize-positions"> Champion team</td>
                      <td>
                        {" "}
                        <strong>LKR 30,000.00</strong>
                      </td>
                    </tr>
                    <tr>
                      <td className="prize-positions"> 1st Runner up</td>
                      <td>
                        {" "}
                        <strong>LKR 20,000.00</strong>
                      </td>
                    </tr>
                    <tr>
                      <td className="prize-positions"> 2nd Runner up</td>
                      <td>
                        {" "}
                        <strong>LKR 10,000.00</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default Structure;

import React from "react";
import "./Timeline.css";
import { DATES, fmt } from "../config/dates";

function Timeline() {

  const now = new Date();

  const events = [
    { date: DATES.registrationOpen,  evt: "Registration Opens" },
    { date: DATES.registrationClose, evt: "Registration Closes" },
    { date: DATES.stage1Close,       evt: "Report Submission Deadline" },
    { date: DATES.workshopDate,      evt: "Dashboard Workshop" },
    { date: DATES.top10Announce,     evt: "Top 10 Announcement" },
    { date: DATES.stage3Close,       evt: "Dashboard Competition" },
    { date: DATES.top5Announce,      evt: "Top 5 Announcement" },
    { date: DATES.presentations,     evt: "Final Presentations" },
    { date: DATES.winnersAnnounce,   evt: "Winners Announced" },
    { date: DATES.statDay,           evt: "Stat Day Ceremony", final: true },
  ];

  return (
    <>
      <div className="sec-divider" id="sec-timeline"></div>
      <div id="timeline-container">
        <div className="sec-wrap reveal">
          <h2 className="sec-title">
            Key <span>Dates</span>
          </h2>

          <div className="timeline-vertical">
            <div className="tl-spine-vertical"></div>
            
           {events.map((item, index) => {
              // ── ✅ CHANGED: compute status for visual indicator ──
              const isPast    = now > item.date;
              const isToday   = fmt(now, "full") === fmt(item.date, "full");
              const statusCls = isToday ? "today" : isPast ? "past" : "future";
 
              return (
                <div
                  key={index}
                  className={`tl-node-v ${item.final ? "final" : ""} tl-node-v--${statusCls}`}
                >
                  <div className="tl-dot-v"></div>
                  <div className="tl-content-v">
                    <div className="tl-card-v">
                      {/* ── ✅ CHANGED: date rendered from DATES object via fmt() ── */}
                      <div className="tl-date">{fmt(item.date, "full")}</div>
                      <div className="tl-evt">{item.evt}</div>
                      {/* ── ✅ CHANGED: past badge shown automatically ── */}
                      {isPast && !isToday && (
                        <span className="tl-badge tl-badge--past">Completed</span>
                      )}
                      {isToday && (
                        <span className="tl-badge tl-badge--today">Today</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default Timeline;
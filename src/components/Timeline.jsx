import React from "react";
import "./Timeline.css";

function Timeline() {
  const events = [
    { date: "28 Mar 2026", evt: "Registration Opens" },
    { date: "8 Apr 2026", evt: "Registration Closes" },
    { date: "24 Apr 2026", evt: "Report Submission" },
    { date: "3 May 2026", evt: "Dashboard Workshop + E-Cert" },
    { date: "4 May 2026", evt: "Top 10 Announcement" },
    { date: "10 May 2026", evt: "Dashboard Competition" },
    { date: "13 May 2026", evt: "Top 5 Announcement" },
    { date: "17 May 2026", evt: "Final Presentations" },
    { date: "23 May 2026", evt: "Winners Announced" },
    { date: "4 Jun 2026", evt: "Stat Day Ceremony", final: true },
  ];

  return (
    <>
      <div className="sec-divider" id="sec-timeline"></div>
      <div id="timeline-container">
        <div className="sec-wrap reveal">
          <div className="sec-eyebrow">// 02 · Timeline</div>
          <h2 className="sec-title">
            Key <span>Dates</span>
          </h2>

          <div className="timeline-vertical">
            <div className="tl-spine-vertical"></div>
            
            {events.map((item, index) => (
              <div key={index} className={`tl-node-v ${item.final ? "final" : ""}`}>
                <div className="tl-dot-v"></div>
                <div className="tl-content-v">
                  <div className="tl-card-v">
                    <div className="tl-date">{item.date}</div>
                    <div className="tl-evt">{item.evt}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Timeline;
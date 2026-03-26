import React from "react";
import "./Structure.css";

function Structure() {
  return (
    <>
      <div className="sec-divider" id="sec-structure"></div>
      <div className="sec-wrap reveal">
        <h2 className="sec-title">
          Competition <span>Stages</span>
        </h2>
        <div className="stages-wrap">
          <div className="stage">
            <div className="stage-badge">Preliminary · Stage 1</div>
            <h3>Data Analysis & Report</h3>
            <ul>
              <li>
                Analyze an ethically sourced dataset of <strong>500–5,000 records</strong>.
              </li>
              <li>
                Submit a <strong>PDF report</strong>, dataset, and analysis scripts/code.
              </li>
              <li>
                Tools: Minitab, R, SPSS, Python, or other analytical platforms.
              </li>
              <li>
                Deadline: <strong>24th April 2026</strong> before 12:00 noon.
              </li>
            </ul>
          </div>

          <div className="stage">
            <div className="stage-badge">Preliminary · Stage 2</div>
            <h3>Online Dashboard Workshop</h3>
            <ul>
              <li>
                <strong>Mandatory</strong> session for all registered teams.
              </li>
              <li>
                Delivered by <strong>Statistics Society alumni</strong> and industry experts.
              </li>
              <li>
                Focuses on professional dashboard creation and standards.
              </li>
              <li>
                Held on <strong>3rd May 2026</strong> (1.00pm – 4.00pm); Top 10 teams advance.
              </li>
            </ul>
          </div>

          <div className="stage">
            <div className="stage-badge">Intermediate · Stage 3</div>
            <h3>Dashboard Competition & Final Presentation</h3>
            <ul>
              <li>
                <strong>Physical round</strong> at the Blended Learning Center (BLC), USJ.
              </li>
              <li>
                Transform a new dataset into an <strong>interactive dashboard</strong>.
              </li>
              <li>
                <strong>Closed-book:</strong> No external resources allowed during the task.
              </li>
              <li>
                Held on <strong>10th May 2026</strong>; Top 5 teams reach the finals.
              </li>
            </ul>
          </div>

          <div className="stage">
            <div className="stage-badge">Final · Stage 4</div>
            <h3>Stat Day & Award Ceremony</h3>
            <ul>
              <li>
                Top 5 present to judges on <strong>17th May 2026</strong>.
              </li>
              <li>
                Demonstrate methodology, design choices, and <strong>data storytelling</strong>.
              </li>
              <li>
                Winners recognized at <strong>Stat Day & Award Ceremony</strong> (4th June 2026).
              </li>
              <li>
                Prizes for Champion team, 1st Runner up, 2nd Runner up - <strong>LKR 30,000.00, LKR 20,000.00, LKR 10,000.00</strong> respectively.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default Structure;

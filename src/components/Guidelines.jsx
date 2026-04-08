import React, { useEffect, useEffectEvent } from "react";
import "./Guidelines.css";
import { DATES, fmt } from "../config/dates";

function Guidelines() {
  function showTab(btn, id) {
    document
      .querySelectorAll(".tab")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll(".tab-pane")
      .forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(id).classList.add("active");
  }

  return (
    <>
      <div className="sec-divider" id="sec-guidelines"></div>
      <div
        style={{
          position: "relative",
          zIndex: 1,
          background: "rgba(2,14,28,0.55)",
        }}
      >
        <div className="sec-wrap reveal">
          <h2 className="sec-title">
            Rules & <span>Guidelines</span>
          </h2>

          <div className="tab-bar">
            <button
              className="tab active"
              onClick={(e) => showTab(e.currentTarget, "g-reg")}
            >
              Registration
            </button>
            <button
              className="tab"
              onClick={(e) => showTab(e.currentTarget, "g-quiz")}
            >
              General Rules
            </button>
            <button
              className="tab"
              onClick={(e) => showTab(e.currentTarget, "g-prelim")}
            >
              Stage 1 & 2
            </button>
            <button
              className="tab"
              onClick={(e) => showTab(e.currentTarget, "g-inter")}
            >
              Stage 3 & 4
            </button>
            <button
              className="tab"
              onClick={(e) => showTab(e.currentTarget, "g-tech")}
            >
              Technical & Submission
            </button>
          </div>

          <div id="g-reg" className="tab-pane active">
            <ul className="gl-list">
              <li>
                <span className="n">01</span>Participants can be undergraduates{" "}
                of state and private universities and students at other
                educational institutes.
              </li>
              <li>
                <span className="n">02</span>A team should consist of a{" "}
                <strong>minimum of 3 members</strong> and a{" "}
                <strong>maximum of 4 members</strong>.
              </li>
              <li>
                <span className="n">03</span>For all stages,{" "}
                <strong>all team members</strong> must actively participate.
              </li>
              <li>
                <span className="n">04</span>All team members must be from the{" "}
                <strong>same university or higher education institution</strong>
                .
              </li>
              <li>
                <span className="n">05</span>Undergraduates must confirm student
                status by submitting a{" "}
                <strong>scanned copy of their university ID</strong>.
              </li>
              <li>
                <span className="n">06</span>
                Registration is open from{" "}
                <strong>{fmt(DATES.registrationOpen, "long")}</strong> to{" "}
                <strong>{fmt(DATES.registrationClose, "long")}</strong>.
              </li>
            </ul>
          </div>

          <div id="g-quiz" className="tab-pane">
            <ul className="gl-list">
              <li>
                <span className="n">01</span>Limited AI use permitted for
                technical analysis and dashboarding only. AI is strictly
                prohibited for report writing; all text must be original and
                explainable by the team.
              </li>
              <li>
                <span className="n">02</span>All work must be original and
                completed solely by the team members using{" "}
                <strong>permitted platforms</strong>.
              </li>
              <li>
                <span className="n">03</span>Participants must report to the
                venue by <strong>9:30 a.m.</strong> on physical competition
                days.
              </li>
              <li>
                <span className="n">04</span>All decisions made by the
                evaluators are <strong>final</strong> and not subject to change.
              </li>
              <li>
                <span className="n">05</span>A <strong>smart casual</strong>{" "}
                dress code is encouraged for all participants.
              </li>
            </ul>
          </div>

          <div id="g-prelim" className="tab-pane">
            <ul className="gl-list">
              <li>
                <span className="n">01</span>
                <strong>Stage 1 (Online):</strong> Analyze an ethically sourced
                dataset (500–5,000 records) on public health, environment, or
                economics.
              </li>
              <li>
                <span className="n">02</span>Submissions must include a folder
              including a pdf report, dataset and analysis scripts.
              </li>
              <li>
                <span className="n">03</span>Deadline for Stage 1:{" "}
                <strong>
                  {fmt(DATES.stage1Close, "long")} before 12:00 noon
                </strong>
                .
              </li>
              <li>
                <span className="n">04</span>
                <strong>Stage 2 (Online):</strong> Mandatory workshop on{" "}
                <strong>{fmt(DATES.workshopDate, "long")}</strong> focused on
                dashboard standards.
              </li>
              <li>
                <span className="n">05</span>The <strong>top 10 teams</strong>{" "}
                are selected after Stage 2 to advance based on analytical
                excellence.
              </li>
            </ul>
          </div>

          <div id="g-inter" className="tab-pane">
            <ul className="gl-list">
              <li>
                <span className="n">01</span>
                <strong>Stage 3 (Physical):</strong> Dashboard competition held
                at the <strong>BLC, Faculty of Applied Sciences, USJ</strong>.
              </li>
              <li>
                <span className="n">02</span>This is a{" "}
                <strong>closed-book</strong> competition; no external resources
                are permitted during the task.
              </li>
              <li>
                <span className="n">03</span>The <strong>top 5 teams</strong>{" "}
                will be selected based on visualization quality and analytical
                depth.
              </li>
              <li>
                <span className="n">04</span>
                <strong>Stage 4 (Finals):</strong> Top 5 teams deliver
                presentations to judges on{" "}
                <strong>{fmt(DATES.presentations, "long")}</strong>.
              </li>
              <li>
                <span className="n">05</span>Presentations must showcase the
                dashboard, methodology, and{" "}
                <strong>key actionable insights</strong>.
              </li>
            </ul>
          </div>

          <div id="g-tech" className="tab-pane">
            <ul className="gl-list">
              <li>
                <span className="n">01</span>
                <strong>Permitted Tools:</strong> Minitab, R, SPSS, Python, or
                other analytical platforms/programming environments.
              </li>
              <li>
                <span className="n">02</span>
                <strong>Evaluation Criteria:</strong> Includes accuracy, clarity
                of insights, technical proficiency, and data storytelling.
              </li>
              <li>
                <span className="n">03</span>
                <strong>Certification:</strong> All participants receive{" "}
                <strong>e-certificates</strong> for participation.
              </li>
              <li>
                <span className="n">04</span>
                <strong>Stage 4 Rewards:</strong> Champion: LKR 30,000; 1st
                Runner-up: LKR 20,000; 2nd Runner-up: LKR 10,000.
              </li>
              <li>
                <span className="n">05</span>Award ceremony takes place during{" "}
                <strong>Statistics Day</strong> on{" "}
                <strong>{fmt(DATES.statDay, "long")}</strong>.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default Guidelines;

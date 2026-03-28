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
                Submit a folder including a pdf report, dataset and analysis scripts.
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
                Delivered by industry and academic experts.
              </li>
              <li>
                Focuses on professional dashboard creation and standards.
              </li>
              <li>
                Held on <strong>3rd May 2026</strong>
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
                <strong>Open-book:</strong> Participants are allowed to refer any external resource.
              </li>
              <li>
                Held on <strong>10th May 2026</strong>; Top 5 teams reach the finals.
              </li>
              <li>
                Fianl presenations on <strong>17th May 2026</strong>.
              </li>
            </ul>
          </div>

          <div className="stage">
            <div className="stage-badge">Final · Stage 4</div>
            <h3>Stat Day & Award Ceremony</h3>
            <ul>    
              <li>
                Demonstrate methodology, design choices, and <strong>data storytelling</strong>.
              </li>
              <li>
                Winners recognized at <strong>Stat Day & Award Ceremony</strong>{" "}4th June 2026.
              </li>
              <li>
                Prizes<br/> 
                <table>
                  <tbody>
                    <tr>
                      <td className="prize-positions"> Champion team</td>
                      <td> <strong>LKR 30,000.00</strong></td>
                    </tr>
                    <tr>
                      <td className="prize-positions"> 1st Runner up</td>
                      <td> <strong>LKR 20,000.00</strong></td>
                    </tr>
                    <tr>
                      <td className="prize-positions"> 2nd Runner up</td>
                      <td> <strong>LKR 10,000.00</strong></td>
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

import React from "react";
import "./Organizers.css";
import stat_logo from "../assets/stat_logo.png";
import stat_name from "../assets/stat_name_logo.png";

function Organizers() {
  return (
    <>
      <div className="sec-divider" id="sec-organizers"></div>
      <div className="sec-wrap reveal">
        <div className="sec-eyebrow" style={{ textAlign: "center" }}>
          // 05 · Organizers
        </div>
        <h2 className="sec-title" style={{ textAlign: "center" }}>
          Organized <span>By</span>
        </h2>

        <div className="org-center">
          <div className="org-logo-ring">
            <img
              src={stat_logo}
              alt="Statistics Society"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
          <div className="org-name-container">
            <div className="org-logo-name-slot" id="org-logo-name-slot">
              <img
                src={stat_name}
                alt="Stat-society name logo"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          </div>

          <div className="contacts">
            <div className="ccard">
              <div className="role">Senior Treasurer</div>
              <div className="name">
                Dr. Chathuri Jayasinghe
                <br />
                (Senior Lecturer)
              </div>
              <div className="phone">076 288 0394</div>
            </div>
            <div className="ccard">
              <div className="role">President</div>
              <div className="name">Ms. Anuradha Perera</div>
              <div className="phone">077 455 1017</div>
            </div>
            <div className="ccard">
              <div className="role">Secretary</div>
              <div className="name">Ms. Nathasha Ninthushi</div>
              <div className="phone">076 973 5263</div>
            </div>
          </div>

          <div className="socials">
            <a href="mailto:statsociety@sci.sjp.ac.lk" className="social-btn">
              <svg viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              statsociety@sci.sjp.ac.lk
            </a>
            <a
              href="https://science.sjp.ac.lk/sta/statistics-society/"
              className="social-btn"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              statsociety@sci.sjp.ac.lk
            </a>
            {/* REPLACE # WITH ACTUAL LINKEDIN URL */}
            <a
              href="https://lk.linkedin.com/company/statistics-society-university-of-sri-jayewardenepura"
              target="_blank"
              className="social-btn"
            >
              <svg viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
              LinkedIn
            </a>
            {/* REPLACE # WITH ACTUAL FACEBOOK URL */}
            <a
              href="https://www.facebook.com/StatSociety/"
              target="_blank"
              className="social-btn"
            >
              <svg viewBox="0 0 24 24">
                <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
              </svg>
              Facebook
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default Organizers;

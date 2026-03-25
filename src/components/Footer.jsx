import React from "react";
import "./Footer.css";
import stat_logo from "../assets/stat_logo.png";
import stat_name from "../assets/stat_name_logo.png";

function Footer() {
  return (
    <>
      <div className="sec-divider"></div>
      <footer>
        <div className="ft-left">
          <div className="ft-logo">
            <img
              src={stat_logo}
              alt="Stat Society"
              onError={(e) => {
                e.currentTarget.parentElement.innerHTML =
                  '<span style="font-size:1.4rem">📊</span>';
              }}
            />
          </div>

          <div className="ft-info">
            <div className="nb-logo-name-slot" id="nb-logo-name-slot">
              <img
                src={stat_name}
                alt="DataXplore logo"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          </div>
        </div>
        <div className="ft-right">
          <div className="ev">DATAXPLORE 2.0</div>
          <div className="cp">
            © 2026 Statistics Society, USJ. All rights reserved.
            <br />
            Developed by TS CSA,USJ
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;

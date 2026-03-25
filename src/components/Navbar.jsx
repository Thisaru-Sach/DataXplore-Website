import React from "react";
import "./Navbar.css";
import data_name from "../assets/name_logo_1.png";

function Navbar() {
  return (
    <>
      <nav id="navbar">
        <div className="nb-logo-name-slot" id="nb-logo-name-slot">
          <a href="#">
          <img
            src={data_name}
            alt="DataXplore logo"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          </a>
        </div>
        <ul className="nb-links">
          <li>
            <a href="#sec-about">About</a>
          </li>
          <li>
            <a href="#sec-timeline">Timeline</a>
          </li>
          <li>
            <a href="#sec-structure">Structure</a>
          </li>
          <li>
            <a href="#sec-guidelines">Guidelines</a>
          </li>
          <li>
            <a href="#sec-organizers">Organizers</a>
          </li>
          {/* REPLACE THE # BELOW WITH YOUR GOOGLE FORM LINK  */}
          <li>
            <a href="#" className="btn-reg">
              ⬡ Register
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default Navbar;

import React, { useState } from "react";
import "./Navbar.css";
import data_name from "../assets/name_logo_1.png";

import { DATES, getPhase, fmt } from "../config/dates";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const phase = getPhase();
    const regOpen =
      phase === "bypass" ||
      phase === "reg_open";

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    // Toggle a class on the body to prevent background scrolling
    document.body.classList.toggle("menu-open");
  };

  const closeMenu = () => {
    setIsOpen(false);
    document.body.classList.remove("menu-open");
  };

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

        {/* 3. Hamburger Button */}
        <button
          className={`nb-hamburger ${isOpen ? "active" : ""}`}
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* 4. Toggle class based on state */}
        <ul className={`nb-links ${isOpen ? "nb-open" : ""}`}>
          <li>
            <a href="#sec-about" onClick={closeMenu}>
              About
            </a>
          </li>
          <li>
            <a href="#sec-timeline" onClick={closeMenu}>
              Timeline
            </a>
          </li>
          <li>
            <a href="#sec-structure" onClick={closeMenu}>
              Structure
            </a>
          </li>
          <li>
            <a href="#sec-guidelines" onClick={closeMenu}>
              Guidelines
            </a>
          </li>
          <li>
            <a href="#sec-organizers" onClick={closeMenu}>
              Organizers
            </a>
          </li>
          <li>
            {regOpen ? (
            <a
              href="https://tally.so/r/dWPLVD"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-reg"
              onClick={closeMenu}
            >
              ⬡ Register 
            </a>
          ) : (
            // Registration closed — show a disabled/greyed button with deadline info
            <span className="btn-reg btn-reg--disabled">
              Registration Closed
            </span>
          )}
          </li>
        </ul>
      </nav>
    </>
  );
}

export default Navbar;

import React from "react";
import './Navbar.css';

function Navbar() {
  return (
    <>
      <nav id="navbar">
        <div className="nb-logo">
          DATA<span className="dx">X</span>PLORE <span className="ver">2.0</span>
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
            <a href="#" target="_blank" className="btn-reg">
              ⬡ Register
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default Navbar;

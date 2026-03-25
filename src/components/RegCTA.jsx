import React from "react";
import "./RegCTA.css";

function RegCTA() {
  return (
    <>
      <div className="sec-divider"></div>
      <section id="sec-register" className="reveal">
        <div className="big">
          Ready to <span>Explore the Data?</span>
        </div>
        <p>
          Registration opens 28th March 2026. Form your team and join the
          challenge.
        </p>
        {/* REPLACE # WITH YOUR GOOGLE FORM LINK */}
        <a
          href="#"
          target="_blank"
          className="btn-primary"
          style={{fontSize:"0.85rem",padding:"16px 60px"}}
        >
          Register Now →
        </a>
      </section>
    </>
  );
}

export default RegCTA;

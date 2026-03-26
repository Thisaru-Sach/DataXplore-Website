import React from "react";
import "./RegCTA.css";
import { DATES, getPhase, fmt } from "../config/dates";

function RegCTA() {
  const phase = getPhase();
  const now = new Date();

  // Is registration currently open?
  const regOpen = phase === "bypass" || phase === "reg_open";

  // Has registration not opened yet?
  const regNotYet = now < DATES.registrationOpen;

  return (
    <>
      <div className="sec-divider"></div>
      <section id="sec-register" className="reveal">
        {regOpen ? (
          <div className="big">
            Ready to <span>Explore the Data?</span>
          </div>
        ) : regNotYet ? (
          <div className="big">
            Registration Opens{" "}
            <span>{fmt(DATES.registrationOpen, "long")}</span>
          </div>
        ) : (
          <div className="big">
            Registration is <span>Now Closed</span>
          </div>
        )}

        {regOpen && (
          <p>
            Registration closes{" "}
            <strong>{fmt(DATES.registrationClose, "long")}</strong>. Form your
            team and join the challenge.
          </p>
        )}
        {regNotYet && (
          <p>
            Mark your calendar registration opens on{" "}
            <strong>{fmt(DATES.registrationOpen, "long")}</strong>.
          </p>
        )}
        {!regOpen && !regNotYet && (
          <p>
            Registration closed on{" "}
            <strong>{fmt(DATES.registrationClose, "long")}</strong>. Thank you
            to all teams who signed up!
          </p>
        )}

        {/* REPLACE # WITH YOUR GOOGLE FORM LINK */}
        {regOpen ? (
          <a
            href="https://tally.so/r/Np0kpG"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ fontSize: "0.85rem", padding: "16px 60px" }}
          >
            Register Now →
          </a>
        ) : (
          <span
            className="btn-primary btn-primary--disabled"
            style={{ fontSize: "0.85rem", padding: "16px 60px" }}
          >
            {regNotYet
              ? "Opens " + fmt(DATES.registrationOpen, "short")
              : "Registration Closed"}
          </span>
        )}
      </section>
    </>
  );
}

export default RegCTA;

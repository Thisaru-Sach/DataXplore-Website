import React from "react";
import "./Hero.css";
import data_logo from "../assets/logo_only.png";
import data_name from "../assets/name_logo_1.png";

import { DATES, getPhase, fmt } from "../config/dates";

function Hero() {

  const phase = getPhase();
  const regOpen =
    phase === "bypass" ||
    phase === "reg_open";

  return (
    <>
      <section id="hero">
        <div className="ring"></div>
        <div className="ring"></div>
        <div className="ring"></div>

        <div className="hero-chip">
          STATISTICS SOCIETY <br/> UNIVERSITY OF SRI JAYEWARDENEPURA
        </div>

        {/*  Event logo placeholder — swap the inner content with your <img> tag  */}
        <div className="hero-logo-slot" id="event-logo-slot">
          <img
            src={data_logo}
            alt="Statistics Society"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
        <div className="hero-logo-name-slot" id="event-logo-name-slot">
          <img
            src={data_name}
            alt="Statistics Society"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
        <p className="hero-sub">Inter-University Data Analytics Competition</p>
        <p className="hero-desc">
          Where data meets discovery, explore, analyze, and transform insights
          into impact.
        </p>

        <div className="hero-stats">
          <div className="hs-item">
             <span className="val">{fmt(DATES.registrationOpen,  "short")}</span>
            <span className="lbl">Reg Opens</span>
          </div>
          <div className="hs-item">
             <span className="val">{fmt(DATES.registrationClose, "short")}</span>
            <span className="lbl">Reg Closes</span>
          </div>
          <div className="hs-item">
            <span className="val">3 – 4</span>
            <span className="lbl">Team Size</span>
          </div>
          <div className="hs-item">
            <span className="val">4</span>
            <span className="lbl">Stages</span>
          </div>
          <div className="hs-item">
            <span className="val">LKR 60K+</span>
            <span className="lbl">Prize Pool</span>
          </div>
        </div>

        <div className="hero-btns">
          {regOpen ? (
            <a
              href="https://tally.so/r/dWPLVD"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Register Your Team →
            </a>
          ) : (
            // Registration closed — show a disabled/greyed button with deadline info
            <span className="btn-primary btn-primary--disabled">
              Registration Closed
            </span>
          )}
          <a href="#sec-about" className="btn-outline">
            Learn More
          </a>
        </div>
      </section>
    </>
  );
}

export default Hero;

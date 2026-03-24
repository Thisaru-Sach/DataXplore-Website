import React from "react";
import './Hero.css';

function Hero() {
    
    return(
        <>
        <section id="hero">
  <div className="ring"></div>
  <div className="ring"></div>
  <div className="ring"></div>

  <div className="hero-chip">STATISTICS SOCIETY &nbsp;·&nbsp; UNIVERSITY OF SRI JAYEWARDENEPURA</div>

  {/*  Event logo placeholder — swap the inner content with your <img> tag  */}
  <div className="hero-logo-slot" id="event-logo-slot">
    <div className="slot-icon">⬡</div>
    <div className="slot-label">EVENT LOGO<br/>PLACE HERE</div>
  </div>

  <h1 className="hero-title">
    <span className="t1">DATA</span><span className="t2">X</span><span className="t3">PLORE</span><span className="t4">2.0</span>
  </h1>
  <p className="hero-sub">Inter-University Data Analytics Competition</p>
  <p className="hero-desc">Where data meets discovery — explore, analyze, and transform insights into impact.</p>

  <div className="hero-stats">
    <div className="hs-item"><span className="val">28 Mar</span><span className="lbl">Reg Opens</span></div>
    <div className="hs-item"><span className="val">8 Apr</span><span className="lbl">Reg Closes</span></div>
    <div className="hs-item"><span className="val">3 – 4</span><span className="lbl">Team Size</span></div>
    <div className="hs-item"><span className="val">4</span><span className="lbl">Stages</span></div>
    <div className="hs-item"><span className="val">LKR 60K+</span><span className="lbl">Prize Pool</span></div>
  </div>

  <div className="hero-btns">
    {/* REPLACE # WITH YOUR GOOGLE FORM LINK  */}
    <a href="#" target="_blank" className="btn-primary">Register Your Team →</a>
    <a href="#sec-about" className="btn-outline">Learn More</a>
  </div>
</section>
        </>
    );
}

export default Hero;
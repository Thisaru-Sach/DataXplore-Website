import React from "react";
import "./About.css";

function About() {
  return (
    <>
      <div className="sec-divider" id="sec-about"></div>
      <div className="sec-wrap reveal">
        <h2 className="sec-title">
          What is <span>DataXplore?</span>
        </h2>
        <div className="about-grid">
          <div className="about-body">
            <p>
              <strong>DataXplore 2.0</strong> is an inspiring and dynamic
              inter-university data analytics competition organized by the{" "}
              <strong>
                Statistics Society of the University of Sri Jayewardenepura
              </strong>
              .
            </p>
            <p>
              It serves as a creative arena where students dive deep into data
              analysis, explore innovative modelling techniques, and transform
              raw information into meaningful narratives celebrating
              analytical thinking, curiosity, and data-driven storytelling.
            </p>
            <p>
              Teams are challenged to investigate real-world datasets, uncover
              hidden patterns, and communicate their findings compellingly,
              strengthening both technical skills and critical thinking.
            </p>
            <div className="about-pills">
              <span className="pill">Data Analysis</span>
              <span className="pill">Dashboards</span>
              <span className="pill">Storytelling</span>
              <span className="pill">Model Explainability</span>
            </div>
          </div>
          <div className="about-cards">
            <div className="acard">
              <h3>🎯 Vision</h3>
              <p>
                Empower the next generation of data-driven innovators, fostering
                a community that values the transformative power of statistics
                and data science.
              </p>
            </div>
            <div className="acard">
              <h3>🚀 Mission</h3>
              <p>
                Create an engaging platform where participants enhance
                analytical skills, explore data creatively, and communicate
                insights — shaping future leaders in data science.
              </p>
            </div>
            <div className="acard">
              <h3>👥 Who Can Join</h3>
              <p>
                Undergraduates from state and private universities. Teams of 3–4
                members from the same institution, verified with a university
                ID.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default About;

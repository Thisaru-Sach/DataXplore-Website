import React, { useEffect } from "react";
import Canvas from "../components/Canvas.jsx";
import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";
import About from "../components/About.jsx";
import Timeline from "../components/Timeline.jsx";
import Structure from "../components/Structure.jsx";
import Guidelines from "../components/Guidelines.jsx";
import RegCTA from "../components/RegCTA.jsx";
import Organizers from "../components/Organizers.jsx";
import Footer from "../components/Footer.jsx";


function Home() {

  useEffect(() => {
    /* ────────────────────────────────────────
       SCROLL REVEAL
    ───────────────────────────────────────── */
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("in");
        });
      },
      { threshold: 0.08 }
    );

    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    /* ────────────────────────────────────────
       NAVBAR ACTIVE LINK
    ───────────────────────────────────────── */
    const handleScroll = () => {
      const y = window.scrollY + 80;
      document.querySelectorAll('[id^="sec-"]').forEach((s) => {
        const lnk = document.querySelector(`.nb-links a[href="#${s.id}"]`);
        if (!lnk) return;
        if (s.offsetTop <= y && s.offsetTop + s.offsetHeight > y) {
          lnk.style.color = "var(--cyan2)";
        } else {
          lnk.style.color = "";
        }
      });
    };

    window.addEventListener("scroll", handleScroll);

    // cleanup when component unmounts
    return () => {
      window.removeEventListener("scroll", handleScroll);
      io.disconnect();
    };
  }, []);


  return (
    <>
    <Canvas/>
    <Navbar/>
    <Hero/>
    <About/>
    <Timeline/>
    <Structure/>
    <Guidelines/>
    <RegCTA/>
    <Organizers/>
    <Footer/>
    </>
  );
}

export default Home;
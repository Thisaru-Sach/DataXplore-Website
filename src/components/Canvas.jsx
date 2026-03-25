import { useEffect, useRef } from "react";

const PARTICLE_COUNT = 90;
const LINK_DIST     = 150;
const SPEED         = 0.35;
const DOT_MIN_R     = 1.2;
const DOT_MAX_R     = 2.6;

const BG_INNER  = "#002548";
const BG_OUTER  = "#010d1a";
const DOT_COL   = "#00c8f0";
const LINE_COL  = { r: 0, g: 185, b: 220 };

export default function Canvas() {
  const cvRef = useRef(null);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");

    let W = 0, H = 0, rafId = null;
    let particles = [];
    let dpr = window.devicePixelRatio || 1;

    function makeParticle() {
      const angle = Math.random() * Math.PI * 2;
      const spd = SPEED * (0.4 + Math.random() * 0.6);
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        r: DOT_MIN_R + Math.random() * (DOT_MAX_R - DOT_MIN_R),
        phase: Math.random() * Math.PI * 2,
        tSpd: 0.4 + Math.random() * 1.0,
      };
    }

    function init() {
      // 1. Get physical size vs CSS size
      dpr = window.devicePixelRatio || 1;
      W = window.innerWidth;
      H = window.innerHeight;

      // 2. Scale the canvas internal coordinate system for sharpness
      cv.width = W * dpr;
      cv.height = H * dpr;
      ctx.scale(dpr, dpr);

      // 3. Adjust particle count based on screen density
      // Reduces lag on mobile, increases density on desktop
      const areaScale = (W * H) / (1440 * 900);
      const count = Math.round(PARTICLE_COUNT * areaScale);
      particles = Array.from(
        { length: Math.max(30, Math.min(count, 150)) }, 
        makeParticle
      );
    }

    function drawBg() {
      const g = ctx.createRadialGradient(
        W / 2, H / 2, 0,
        W / 2, H / 2, Math.hypot(W, H) / 2
      );
      g.addColorStop(0.00, BG_INNER);
      g.addColorStop(0.50, "#011828");
      g.addColorStop(1.00, BG_OUTER);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    function drawLink(ax, ay, bx, by, dist) {
      const fade = 1 - dist / LINK_DIST;
      const a = fade * 0.5;
      if (a < 0.02) return;

      ctx.beginPath();
      ctx.globalAlpha = a;
      ctx.strokeStyle = `rgb(${LINE_COL.r},${LINE_COL.g},${LINE_COL.b})`;
      ctx.lineWidth = 0.8;
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
      ctx.globalAlpha = 1.0; 
    }

    function drawDot(p, ts) {
      const twinkle = 0.6 + 0.4 * Math.sin(p.phase + ts * 0.001 * p.tSpd);
      const hR = p.r * 5;

      // Halo
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, hR);
      g.addColorStop(0, `rgba(0,200,240,${(twinkle * 0.3).toFixed(3)})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, hR, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.fillStyle = `rgba(200,240,255,${twinkle.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * twinkle, 0, Math.PI * 2);
      ctx.fill();
    }

    function updateParticle(p) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) { p.x = 0; p.vx *= -1; }
      if (p.x > W) { p.x = W; p.vx *= -1; }
      if (p.y < 0) { p.y = 0; p.vy *= -1; }
      if (p.y > H) { p.y = H; p.vy *= -1; }
    }

    function frame(ts) {
      drawBg();
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            drawLink(particles[i].x, particles[i].y, particles[j].x, particles[j].y, dist);
          }
        }
      }

      for (let p of particles) {
        updateParticle(p);
        drawDot(p, ts);
      }

      rafId = requestAnimationFrame(frame);
    }

    // Start
    init();
    rafId = requestAnimationFrame(frame);

    // Debounced Resize
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        init();
      }, 200); // Wait 200ms after resize ends to re-init
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={cvRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1, // Behind content
        pointerEvents: "none",
        width: "100%",
        height: "100%",
      }}
    />
  );
}
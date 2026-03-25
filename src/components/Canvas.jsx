import { useEffect, useRef } from "react";

/*
  Particles.js-style constellation canvas
  ─────────────────────────────────────────
  · Nodes float freely across the whole canvas
  · Lines drawn between any two nodes closer than LINK_DIST
  · Line opacity fades with distance
  · Nodes bounce off canvas edges
  · Background: prussian blue centre → dark navy edges (radial gradient)
  · Colours: cyan nodes + lines matching the site palette
*/

const PARTICLE_COUNT = 90;      // total floating nodes
const LINK_DIST      = 150;     // max px distance to draw a link
const SPEED          = 0.35;    // base movement speed (px / frame)
const DOT_MIN_R      = 1.2;
const DOT_MAX_R      = 2.6;

const BG_INNER  = "#002548";    // prussian blue
const BG_OUTER  = "#010d1a";    // dark navy
const DOT_COL   = "#00c8f0";    // cyan
const LINE_COL  = { r: 0, g: 185, b: 220 };  // slightly dimmer cyan

export default function Canvas() {
  const cvRef = useRef(null);

  useEffect(() => {
    const cv  = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");

    let W = 0, H = 0, rafId = null;
    let particles = [];

    /* ── create one particle ── */
    function makeParticle() {
      const angle = Math.random() * Math.PI * 2;
      const spd   = SPEED * (0.4 + Math.random() * 0.6);
      return {
        x:  Math.random() * W,
        y:  Math.random() * H,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        r:  DOT_MIN_R + Math.random() * (DOT_MAX_R - DOT_MIN_R),
        // twinkle
        phase: Math.random() * Math.PI * 2,
        tSpd:  0.4 + Math.random() * 1.0,
      };
    }

    /* ── initialise / resize ── */
    function init() {
      W = cv.width  = window.innerWidth;
      H = cv.height = window.innerHeight;

      // scale particle count to screen area
      const count = Math.round(PARTICLE_COUNT * (W * H) / (1440 * 900));
      particles = Array.from({ length: Math.max(40, Math.min(count, 180)) }, makeParticle);
    }

    /* ── background gradient ── */
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

    /* ── draw a line between two close particles ── */
    function drawLink(ax, ay, bx, by, dist) {
      const fade = 1 - dist / LINK_DIST;          // 1 when touching, 0 at limit
      const a    = fade * 0.55;                    // max line opacity
      if (a < 0.02) return;

      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = `rgb(${LINE_COL.r},${LINE_COL.g},${LINE_COL.b})`;
      ctx.lineWidth   = 0.8;
      ctx.shadowColor = DOT_COL;
      ctx.shadowBlur  = 2;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
      ctx.restore();
    }

    /* ── draw a single particle ── */
    function drawDot(p, ts) {
      const twinkle = 0.6 + 0.4 * Math.sin(p.phase + ts * 0.001 * p.tSpd);
      const a       = twinkle;

      // soft glow halo
      const hR = p.r * 5;
      const g  = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, hR);
      g.addColorStop(0,   `rgba(0,200,240,${(a * 0.45).toFixed(3)})`);
      g.addColorStop(0.5, `rgba(0,160,210,${(a * 0.14).toFixed(3)})`);
      g.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, hR, 0, Math.PI * 2);
      ctx.fill();

      // core dot
      ctx.save();
      ctx.shadowColor = DOT_COL;
      ctx.shadowBlur  = 8 * twinkle;
      ctx.fillStyle   = `rgba(200,240,255,${a.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * twinkle, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    /* ── update position, bounce off walls ── */
    function updateParticle(p) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x - p.r < 0)  { p.x = p.r;      p.vx =  Math.abs(p.vx); }
      if (p.x + p.r > W)  { p.x = W - p.r;  p.vx = -Math.abs(p.vx); }
      if (p.y - p.r < 0)  { p.y = p.r;      p.vy =  Math.abs(p.vy); }
      if (p.y + p.r > H)  { p.y = H - p.r;  p.vy = -Math.abs(p.vy); }
    }

    /* ── main animation loop ── */
    function frame(ts) {
      ctx.clearRect(0, 0, W, H);
      drawBg();

      const n = particles.length;

      // draw links first (below dots)
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            drawLink(particles[i].x, particles[i].y, particles[j].x, particles[j].y, dist);
          }
        }
      }

      // update + draw dots on top
      for (let i = 0; i < n; i++) {
        updateParticle(particles[i]);
        drawDot(particles[i], ts);
      }

      rafId = requestAnimationFrame(frame);
    }

    /* ── start ── */
    rafId = requestAnimationFrame(() => {
      init();
      rafId = requestAnimationFrame(frame);
    });

    const onResize = () => {
      cancelAnimationFrame(rafId);
      init();
      rafId = requestAnimationFrame(frame);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={cvRef}
      style={{
        position:      "fixed",
        inset:         0,
        zIndex:        0,
        pointerEvents: "none",
        display:       "block",
      }}
    />
  );
}
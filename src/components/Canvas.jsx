import React, { useEffect, useRef } from "react";
import "./canvas.css";

function Canvas() {
  const cvRef = useRef(null);

  useEffect(() => {
    const cv = cvRef.current;
    const ctx = cv.getContext("2d");
    let W, H;
    let rafId;

    // Data
    let nodes = []; // {x,y,r,phase}
    let segs = []; // {x1,y1,x2,y2}
    let bokeh = []; // {x,y,r,a,da}
    let sparks = []; // {x,y,t,max,sz}
    let pulses = []; // {seg,t,spd}

    const G = 52; // grid size

    function resize() {
      W = cv.width = window.innerWidth;
      H = cv.height = window.innerHeight;
      build();
    }

    function rnd(a, b) {
      return a + Math.random() * (b - a);
    }
    function snap(v, g) {
      return Math.round(v / g) * g;
    }

    function build() {
      nodes = [];
      segs = [];
      bokeh = [];
      sparks = [];
      pulses = [];

      const cols = Math.ceil(W / G) + 2;
      const rows = Math.ceil(H / G) + 2;

      /* nodes */
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          if (Math.random() < 0.2) {
            nodes.push({
              x: c * G,
              y: r * G,
              r: rnd(1.2, 3.2),
              phase: rnd(0, Math.PI * 2),
            });
          }
        }
      }
      /* traces from nodes */
      nodes.forEach((n) => {
        const nb = Math.floor(rnd(1, 4));
        for (let b = 0; b < nb; b++) {
          const horiz = Math.random() < 0.5;
          const len = Math.floor(rnd(1, 6)) * G;
          const sign = Math.random() < 0.5 ? 1 : -1;
          if (horiz) {
            segs.push({ x1: n.x, y1: n.y, x2: n.x + sign * len, y2: n.y });
            if (Math.random() < 0.55) {
              const jl =
                Math.floor(rnd(1, 4)) * G * (Math.random() < 0.5 ? 1 : -1);
              segs.push({
                x1: n.x + sign * len,
                y1: n.y,
                x2: n.x + sign * len,
                y2: n.y + jl,
              });
            }
          } else {
            segs.push({ x1: n.x, y1: n.y, x2: n.x, y2: n.y + sign * len });
            if (Math.random() < 0.55) {
              const jl =
                Math.floor(rnd(1, 4)) * G * (Math.random() < 0.5 ? 1 : -1);
              segs.push({
                x1: n.x,
                y1: n.y + sign * len,
                x2: n.x + jl,
                y2: n.y + sign * len,
              });
            }
          }
        }
      });

      /* bokeh blobs */
      for (let i = 0; i < 32; i++) {
        bokeh.push({
          x: rnd(0, W),
          y: rnd(0, H),
          r: rnd(25, 110),
          a: rnd(0.02, 0.08),
          da: rnd(0.0008, 0.003) * (Math.random() < 0.5 ? 1 : -1),
        });
      }

      /* sparkles on a subset of nodes */
      nodes.forEach((n) => {
        if (Math.random() < 0.1) {
          sparks.push({
            x: n.x,
            y: n.y,
            t: rnd(0, 120),
            max: rnd(90, 160),
            sz: rnd(7, 16),
          });
        }
      });
      /* travelling pulses on some segs */
      segs.forEach((s) => {
        if (Math.random() < 0.13) {
          pulses.push({ seg: s, t: Math.random(), spd: rnd(0.003, 0.009) });
        }
      });
    }

    /* drawing helpers */
    function glowLine(x1, y1, x2, y2, col, w, blur) {
      ctx.save();
      ctx.shadowColor = col;
      ctx.shadowBlur = blur;
      ctx.strokeStyle = col;
      ctx.lineWidth = w;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
    }

    function drawNode(x, y, r, a) {
      /* outer halo */
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 6);
      g.addColorStop(0, `rgba(0,210,255,${a * 0.55})`);
      g.addColorStop(0.35, `rgba(0,160,210,${a * 0.22})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r * 6, 0, Math.PI * 2);
      ctx.fill();
      /* core */
      ctx.save();
      ctx.shadowColor = "#00d8ff";
      ctx.shadowBlur = 14;
      ctx.fillStyle = `rgba(0,228,255,${0.65 + a * 0.35})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawSparkle(x, y, sz, a) {
      ctx.save();
      ctx.globalAlpha = a;
      ctx.shadowColor = "#00d4ff";
      ctx.shadowBlur = 18;
      ctx.strokeStyle = "#bbefff";
      ctx.lineWidth = 1.1;
      [
        [0, -sz, 0, sz],
        [-sz, 0, sz, 0],
        [-(sz * 0.45), -(sz * 0.45), sz * 0.45, sz * 0.45],
        [-(sz * 0.45), sz * 0.45, sz * 0.45, -(sz * 0.45)],
      ].forEach((l) => {
        ctx.beginPath();
        ctx.moveTo(x + l[0], y + l[1]);
        ctx.lineTo(x + l[2], y + l[3]);
        ctx.stroke();
      });
      ctx.fillStyle = "rgba(210,245,255,.92)";
      ctx.beginPath();
      ctx.arc(x, y, sz * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawBokeh(b) {
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      g.addColorStop(0, `rgba(20,120,210,${b.a})`);
      g.addColorStop(0.5, `rgba(8,70,150,${b.a * 0.45})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawPulse(seg, t) {
      const px = seg.x1 + (seg.x2 - seg.x1) * t;
      const py = seg.y1 + (seg.y2 - seg.y1) * t;
      const g = ctx.createRadialGradient(px, py, 0, px, py, 16);
      g.addColorStop(0, "rgba(255,255,255,.95)");
      g.addColorStop(0.25, "rgba(120,235,255,.8)");
      g.addColorStop(1, "rgba(0,180,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(px, py, 16, 0, Math.PI * 2);
      ctx.fill();
    }

    /* main loop */
    function frame(ts) {
      /* background */
      ctx.fillStyle = "#010d1a";
      ctx.fillRect(0, 0, W, H);

      /* deep centre glow (bottom, like reference image) */
      const bg = ctx.createRadialGradient(
        W * 0.5,
        H * 0.9,
        0,
        W * 0.5,
        H * 0.9,
        W * 0.75,
      );
      bg.addColorStop(0, "rgba(0,55,110,.6)");
      bg.addColorStop(0.5, "rgba(0,28,60,.28)");
      bg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      /* top vignette */
      const tv = ctx.createLinearGradient(0, 0, 0, H * 0.45);
      tv.addColorStop(0, "rgba(1,6,14,.75)");
      tv.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = tv;
      ctx.fillRect(0, 0, W, H);

      /* bokeh */
      bokeh.forEach((b) => {
        b.a += b.da;
        if (b.a > 0.1 || b.a < 0.015) b.da *= -1;
        drawBokeh(b);
      });

      /* segs: base dim + glow */
      segs.forEach((s) => {
        glowLine(s.x1, s.y1, s.x2, s.y2, "rgba(0,170,210,0.11)", 1.6, 0);
        glowLine(s.x1, s.y1, s.x2, s.y2, "rgba(0,210,255,0.55)", 0.8, 9);
      });

      /* nodes */
      const t = ts * 0.001;
      nodes.forEach((n) => {
        const a = 0.45 + 0.55 * Math.sin((n.phase += 0.016));
        drawNode(n.x, n.y, n.r, a);
      });

      /* sparkles */
      sparks.forEach((sp) => {
        sp.t++;
        if (sp.t > sp.max) {
          sp.t = 0;
          sp.max = rnd(80, 160);
        }
        const p = sp.t / sp.max;
        const a = p < 0.3 ? p / 0.3 : p > 0.7 ? (1 - p) / 0.3 : 1;
        drawSparkle(sp.x, sp.y, sp.sz * a, a * 0.9);
      });

      /* pulses */
      pulses.forEach((p) => {
        p.t += p.spd;
        if (p.t > 1) p.t = 0;
        drawPulse(p.seg, p.t);
      });

      requestAnimationFrame(frame);
    }
    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(frame);
  }, []);

  return (
    <>
      {/* BG CANVAS  */}
      <canvas ref={cvRef} id="bg-canvas">
        Hi
      </canvas>
    </>
  );
}

export default Canvas;

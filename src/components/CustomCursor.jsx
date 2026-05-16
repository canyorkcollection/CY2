import { useEffect, useRef, useState } from "react";

const brightnessCache = new Map();

function sampleBrightness(imgEl) {
  if (!imgEl?.complete || !imgEl.naturalWidth) return null;
  const key = imgEl.src;
  if (brightnessCache.has(key)) return brightnessCache.get(key);
  try {
    const S = 80;
    const canvas = document.createElement("canvas");
    canvas.width = S; canvas.height = S;
    const ctx = canvas.getContext("2d");
    const sx = Math.max(0, (imgEl.naturalWidth - S) / 2);
    const sy = Math.max(0, (imgEl.naturalHeight - S) / 2);
    ctx.drawImage(imgEl, sx, sy, S, S, 0, 0, S, S);
    const { data } = ctx.getImageData(0, 0, S, S);
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000;
    }
    const result = sum / (S * S) > 140 ? "light" : "dark";
    brightnessCache.set(key, result);
    return result;
  } catch {
    brightnessCache.set(key, null);
    return null;
  }
}

export default function CustomCursor() {
  const wrapRef = useRef(null);
  const [type,  setType]  = useState("default");
  const [color, setColor] = useState("#0047AB");

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.body.classList.add("custom-cursor-active");

    let raf = null;
    let cx = -200, cy = -200;

    function tick() {
      if (wrapRef.current) wrapRef.current.style.transform = `translate(${cx}px, ${cy}px)`;
      raf = null;
    }

    function onMove(e) {
      cx = e.clientX;
      cy = e.clientY;
      if (!raf) raf = requestAnimationFrame(tick);

      const el = document.elementFromPoint(cx, cy);
      if (!el) return;

      // Zoom overlay — dark cobalt bg, always white cursor
      if (el.closest("[data-zoom-overlay]")) {
        setColor("#fff");
        setType("view");
        return;
      }

      // Artwork image areas — sample brightness to pick color
      const target = el.closest(".art-card") || el.closest(".artwork-main-image") || el.closest(".zoom-wrap") || el.closest(".artist-card");
      if (target) {
        const img = target.querySelector("img");
        const tone = sampleBrightness(img);
        setColor(tone === "dark" ? "#fff" : "#0047AB");
        setType("view");
        return;
      }

      // Slider gaps → directional arrows (page bg is always white → cobalt)
      const slider = el.closest(".slider-track");
      if (slider) {
        const { left, width } = slider.getBoundingClientRect();
        setColor("#0047AB");
        setType(cx < left + width / 2 ? "arrow-left" : "arrow-right");
        return;
      }

      // Interactive elements
      if (el.closest("button") || el.closest("a") || el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        setColor("#0047AB");
        setType("link");
        return;
      }

      setColor("#0047AB");
      setType("default");
    }

    document.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      document.body.classList.remove("custom-cursor-active");
      document.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const at = (t) => ({
    position: "absolute",
    transform: "translate(-50%, -50%)",
    opacity: type === t ? 1 : 0,
    transition: "opacity 0.15s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });

  const C = color;

  return (
    <div
      ref={wrapRef}
      style={{
        position: "fixed",
        top: 0, left: 0,
        pointerEvents: "none",
        zIndex: 9999,
        transform: "translate(-200px, -200px)",
      }}
    >
      {/* default: small solid dot */}
      <div style={{ ...at("default"), width: 8, height: 8, borderRadius: "50%", background: C }} />

      {/* view: ring + plus — color adapts to image brightness */}
      <div style={{ ...at("view"), width: 44, height: 44, borderRadius: "50%", border: `1.5px solid ${C}`, color: C, fontSize: "22px", fontWeight: 300, fontFamily: "sans-serif", lineHeight: "44px", transition: "opacity 0.15s ease, border-color 0.2s ease, color 0.2s ease" }}>
        +
      </div>

      {/* link: small outline ring */}
      <div style={{ ...at("link"), width: 20, height: 20, borderRadius: "50%", border: `1.5px solid ${C}`, transition: "opacity 0.15s ease, border-color 0.2s ease" }} />

      {/* arrow left */}
      <div style={at("arrow-left")}>
        <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
          <line x1="37" y1="10" x2="5" y2="10" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
          <polyline points="14,2 4,10 14,18" fill="none" stroke={C} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </div>

      {/* arrow right */}
      <div style={at("arrow-right")}>
        <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
          <line x1="3" y1="10" x2="35" y2="10" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
          <polyline points="26,2 36,10 26,18" fill="none" stroke={C} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

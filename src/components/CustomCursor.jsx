import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const wrapRef = useRef(null);
  const [type, setType] = useState("default");

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

      if (el.closest(".art-card") || el.closest(".zoom-wrap") || el.closest(".artist-card")) {
        setType("view");
        return;
      }
      const slider = el.closest(".slider-track");
      if (slider) {
        const { left, width } = slider.getBoundingClientRect();
        setType(cx < left + width / 2 ? "arrow-left" : "arrow-right");
        return;
      }
      if (el.closest("button") || el.closest("a") || el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT") {
        setType("link");
        return;
      }
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
      {/* default: small cobalt dot */}
      <div style={{ ...at("default"), width: 8, height: 8, borderRadius: "50%", background: "#0047AB" }} />

      {/* view: ring with + */}
      <div style={{ ...at("view"), width: 44, height: 44, borderRadius: "50%", border: "1.5px solid #0047AB", color: "#0047AB", fontSize: "22px", fontWeight: 300, fontFamily: "sans-serif", lineHeight: "44px" }}>
        +
      </div>

      {/* link: small outline ring */}
      <div style={{ ...at("link"), width: 20, height: 20, borderRadius: "50%", border: "1.5px solid #0047AB" }} />

      {/* arrow left */}
      <div style={at("arrow-left")}>
        <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
          <line x1="37" y1="10" x2="5" y2="10" stroke="#0047AB" strokeWidth="1.5" strokeLinecap="round" />
          <polyline points="14,2 4,10 14,18" fill="none" stroke="#0047AB" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </div>

      {/* arrow right */}
      <div style={at("arrow-right")}>
        <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
          <line x1="3" y1="10" x2="35" y2="10" stroke="#0047AB" strokeWidth="1.5" strokeLinecap="round" />
          <polyline points="26,2 36,10 26,18" fill="none" stroke="#0047AB" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { motion } from "motion/react";

export default function LandingIntro({ onComplete }) {
  const [galleryVisible, setGalleryVisible] = useState(false);

  function handlePhase4Complete() {
    setGalleryVisible(true);
  }

  function handleIntroComplete() {
    sessionStorage.setItem("can-york-intro-seen", "true");
    onComplete();
  }

  return (
    <>
      {/* ── Intro overlay ── */}
      <motion.div
        initial={{ backgroundColor: "#0047AB", clipPath: "circle(150% at 50% 50%)", y: "0vh" }}
        animate={{
          backgroundColor: ["#0047AB", "#0047AB", "#FFDCA8"],
          clipPath: galleryVisible
            ? "circle(0% at 50% 50%)"
            : "circle(150% at 50% 50%)",
          y: galleryVisible ? "-100vh" : "0vh",
        }}
        transition={{
          backgroundColor: { duration: 1.5, delay: 1, ease: "easeInOut" },
          clipPath:  { duration: 1.5, delay: 0,    ease: "easeInOut" },
          y:         { duration: 1.5, delay: 0.2,  ease: "easeInOut" },
        }}
        onAnimationComplete={() => {
          if (galleryVisible) handleIntroComplete();
        }}
        style={{
          position: "fixed", inset: 0, zIndex: 3000,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: "2rem",
        }}
      >
        {/* Logo */}
        <motion.h1
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: galleryVisible ? 0 : 1 }}
          transition={galleryVisible
            ? { duration: 0.5, ease: "easeOut" }
            : { duration: 1.2, delay: 0,   ease: "easeOut" }
          }
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: "2.5rem", fontWeight: 600,
            letterSpacing: "0.3em", color: "#fff",
            textTransform: "uppercase", margin: 0,
          }}
        >
          CAN YORK
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: galleryVisible ? 0 : 1, y: galleryVisible ? 15 : 0 }}
          transition={galleryVisible
            ? { duration: 0.5, ease: "easeOut" }
            : { duration: 1, delay: 2, ease: "easeOut" }
          }
          onAnimationComplete={() => {
            // After subtitle fully appears, schedule phase 4 (fade out)
            if (!galleryVisible) {
              setTimeout(handlePhase4Complete, 1200);
            }
          }}
          style={{
            fontFamily: "'EB Garamond', serif",
            fontSize: "1.3rem", color: "#333",
            maxWidth: "600px", textAlign: "center",
            lineHeight: 1.6, fontStyle: "italic", margin: 0,
          }}
        >
          Una selección privada de arte contemporáneo reunida durante dos décadas en los márgenes de lo visible.
        </motion.p>
      </motion.div>
    </>
  );
}
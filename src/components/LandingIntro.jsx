import React, { useState } from "react";
import { motion } from "motion/react";

export default function LandingIntro({ onComplete }) {
  // Controlamos las 3 fases: 1 = Aparecer, 2 = Convertirse en sol, 3 = Subir
  const [phase, setPhase] = useState(1);

  function handleSubtitleComplete() {
    // Esperamos 1.2s tras aparecer el texto para empezar la transformación
    setTimeout(() => {
      setPhase(2); // El texto desaparece y el fondo se hace círculo
      
      // Esperamos a que el círculo se forme (1.5s) y entonces sube
      setTimeout(() => {
        setPhase(3); 
      }, 1500);
    }, 1200);
  }

  function handleRiseComplete() {
    sessionStorage.setItem("can-york-intro-seen", "true");
    onComplete();
  }

  return (
    <motion.div
      initial={{ y: "0vh" }}
      animate={{ y: phase === 3 ? "-100vh" : "0vh" }}
      transition={{ duration: 1.8, ease: "easeInOut" }}
      onAnimationComplete={() => {
        if (phase === 3) handleRiseComplete();
      }}
      style={{
        position: "fixed", inset: 0, zIndex: 3000,
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden" // Importante para que el círculo no desborde
      }}
    >
      {/* --- EL SOL (El fondo que se transforma) --- */}
      <motion.div
        initial={{ 
          width: "100vw", 
          height: "100vh", 
          borderRadius: "0%", 
          backgroundColor: "#0047AB" 
        }}
        animate={{
          backgroundColor: "#FFDCA8", // Pasa a dorado
          width: phase >= 2 ? "280px" : "100vw", // Se hace pequeño
          height: phase >= 2 ? "280px" : "100vh",
          borderRadius: phase >= 2 ? "50%" : "0%", // Se hace círculo
        }}
        transition={{
          backgroundColor: { duration: 1.5, delay: 1, ease: "easeInOut" },
          width: { duration: 1.2, ease: "easeInOut" },
          height: { duration: 1.2, ease: "easeInOut" },
          borderRadius: { duration: 1.2, ease: "easeInOut" },
        }}
        style={{
          position: "absolute",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: "1.5rem",
        }}
      >
        {/* Logo */}
        <motion.h1
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: phase >= 2 ? 0 : 1 }} // Desaparece en la fase 2
          transition={phase >= 2 
            ? { duration: 0.5, ease: "easeOut" } 
            : { duration: 1.2, delay: 0, ease: "easeOut" }
          }
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: "2.5rem", fontWeight: 600,
            letterSpacing: "0.3em", color: "#0047AB",
            textTransform: "uppercase", margin: 0,
            whiteSpace: "nowrap" // Evita que el logo se rompa al encogerse
          }}
        >
          CAN YORK
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: phase >= 2 ? 0 : 1, y: phase >= 2 ? 15 : 0 }}
          transition={phase >= 2 
            ? { duration: 0.5, ease: "easeOut" } 
            : { duration: 1, delay: 2, ease: "easeOut" }
          }
          onAnimationComplete={() => {
            if (phase === 1) handleSubtitleComplete();
          }}
          style={{
            fontFamily: "'EB Garamond', serif",
            fontSize: "1.1rem", 
            color: "#0047AB", // BLANCO como pediste
            textAlign: "center",
            lineHeight: 1.5, fontStyle: "italic", margin: 0,
            maxWidth: "22rem", // Ancho de línea ajustado al tamaño del logo
            padding: "0 1rem"
          }}
        >
          Una selección privada de arte contemporáneo reunida durante dos décadas en los márgenes de lo visible.
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

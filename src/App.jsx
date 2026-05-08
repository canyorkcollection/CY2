import React, { useRef, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Header       from "./components/Header";
import Gallery      from "./components/Gallery";
import ArtworkDetail from "./components/ArtworkDetail";
import Artists      from "./components/Artists";
import ArtistDetail from "./components/ArtistDetail";
import Contact      from "./components/Contact";
import Admin        from "./components/Admin";
import Login        from "./components/Login";
import LandingIntro from "./components/LandingIntro";
import Footer       from "./components/Footer";
import "./styles.css";

function AnimatedRoutes() {
  const location    = useLocation();
  const { session } = useAuth();
  const topRef      = useRef(null);

  const introAlreadySeen = sessionStorage.getItem("can-york-intro-seen") === "true";
  const [showIntro, setShowIntro] = useState(
    !introAlreadySeen && location.pathname === "/"
  );

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [location]);

  if (session === undefined) return null;
if (session === null) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#fff" }}>
      <Login />
      <Footer />
    </div>
  );
}
  return (
    <div ref={topRef} style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#fff", color: "#000" }}>
      <Header />

      <div style={{ flex: 1 }}>
        {/* Intro only on "/" and only once per session */}
        {showIntro && location.pathname === "/" ? (
          <>
            {/* Gallery rendered underneath, hidden until intro completes */}
            <motion.div
              initial={{ y: "100vh" }}
              animate={{ y: showIntro ? "100vh" : "0vh" }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
              style={{ position: "relative" }}
            >
              <div style={{ padding: "4rem 3.5rem" }}>
                <Gallery />
              </div>
            </motion.div>

            <LandingIntro onComplete={() => setShowIntro(false)} />
          </>
        ) : (
          <main style={{ padding: "4rem 3.5rem" }}>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/"            element={<Gallery />} />
                <Route path="/artwork/:id" element={<ArtworkDetail />} />
                <Route path="/artists"     element={<Artists />} />
                <Route path="/artists/:id" element={<ArtistDetail />} />
                <Route path="/contact"     element={<Contact />} />
{/* Protección de ruta: Solo estos dos emails ven el Admin */}
{session?.user?.email && (
  ["canyorkcollection@gmail.com", "sourdiesel@mac.com"].includes(session.user.email) 
    ? <Route path="/admin" element={<Admin />} />
    : null
)}              </Routes>
            </AnimatePresence>
          </main>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

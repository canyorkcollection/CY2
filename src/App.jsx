import React, { useRef, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Header        from "./components/Header";
import Gallery       from "./components/Gallery";
import ArtworkDetail from "./components/ArtworkDetail";
import Artists       from "./components/Artists";
import ArtistDetail  from "./components/ArtistDetail";
import Contact       from "./components/Contact";
import Admin         from "./components/Admin";
import Footer        from "./components/Footer";
import LandingIntro  from "./components/LandingIntro";
import GuestLogin    from "./pages/GuestLogin";
import AdminLogin    from "./pages/AdminLogin";
import AuthCallback  from "./pages/AuthCallback";
import CustomCursor  from "./components/CustomCursor";
import "./styles.css";

function AnimatedRoutes() {
  const location  = useLocation();
  const { session, isAdmin } = useAuth();
  const topRef    = useRef(null);

  const introAlreadySeen = sessionStorage.getItem("can-york-intro-seen") === "true";
  const [showIntro, setShowIntro] = useState(
    !introAlreadySeen && location.pathname === "/"
  );

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [location]);

  if (session === undefined) return null;

  // Public routes — always accessible
  const publicPaths = ["/auth/callback", "/admin/login"];
  if (publicPaths.includes(location.pathname)) {
    return (
      <Routes location={location} key={location.pathname}>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/admin/login"   element={<AdminLogin />} />
      </Routes>
    );
  }

  // Not logged in → guest login
  if (!session) {
    return (
      <Routes location={location} key={location.pathname}>
        <Route path="*" element={<GuestLogin />} />
      </Routes>
    );
  }

  return (
    <div ref={topRef} style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#fff", color: "#000" }}>
      <Header />

      <div style={{ flex: 1 }}>
        {showIntro && location.pathname === "/" ? (
          <>
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
                <Route
                  path="/admin"
                  element={isAdmin ? <Admin /> : <Navigate to="/" replace />}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
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
        <CustomCursor />
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
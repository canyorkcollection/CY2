import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  { label: "Collection", path: "/" },
  { label: "Artists",    path: "/artists" },
  { label: "Contact",    path: "/contact" },
];

export default function Header() {
  const navigate        = useNavigate();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef         = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on route change
  function go(path) { navigate(path); setOpen(false); }

  const navBtn = {
    background: "none", border: "none", fontSize: "1rem",
    color: "#0047AB", cursor: "pointer", letterSpacing: "0.08em",
    fontFamily: "'Sora', sans-serif",
  };

  return (
    <header style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "2.2rem 3.5rem", borderBottom: "1.5px solid #0047AB",
      position: "relative",
    }}>
      {/* Logo */}
      <span
        onClick={() => go("/")}
        style={{ cursor: "pointer", display: "inline-flex", alignItems: "center" }}
      >
        <span className="font-sora" style={{ fontSize: "2.8rem", fontWeight: 700, letterSpacing: "0.18em", color: "#0047AB" }}>
          CAN Y
        </span>
        <span style={{
          display: "inline-block",
          background: "#FFDCA8", borderRadius: "50%",
          width: "2.16em", height: "2.16em",
          marginRight: "0.32em", flexShrink: 0,
        }} />
        <span className="font-sora" style={{ fontSize: "2.8rem", fontWeight: 700, letterSpacing: "0.18em", color: "#0047AB" }}>
          RK
        </span>
      </span>

      {/* Desktop nav */}
      <nav className="header-nav-desktop" style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        {NAV_LINKS.map(l => (
          <button key={l.path} style={navBtn} onClick={() => go(l.path)}>{l.label}</button>
        ))}
        <button className="btn-cobalt font-sora" onClick={signOut} style={{ letterSpacing: "0.12em" }}>
          Sign out
        </button>
      </nav>

      {/* Hamburger button — visible only on mobile via CSS */}
      <button
        className="header-hamburger"
        onClick={() => setOpen(o => !o)}
        aria-label="Menú"
        style={{
          display: "none",           /* overridden by CSS media query */
          background: "none", border: "none",
          cursor: "pointer", padding: "0.2rem",
          flexDirection: "column", gap: "5px",
        }}
      >
        {/* Three bars — CSS will handle display:flex */}
        <span style={{ display: "block", width: "24px", height: "2px", background: open ? "transparent" : "#0047AB", transition: "background 0.2s" }} />
        <span style={{
          display: "block", width: "24px", height: "2px", background: "#0047AB",
          transform: open ? "rotate(45deg) translate(5px, 5px)" : "none",
          transition: "transform 0.25s",
        }} />
        <span style={{
          display: "block", width: "24px", height: "2px", background: "#0047AB",
          transform: open ? "rotate(-45deg) translate(5px, -5px)" : "none",
          transition: "transform 0.25s",
        }} />
      </button>

      {/* Mobile dropdown */}
      {open && (
        <nav
          ref={menuRef}
          className="header-nav-mobile"
          style={{
            position: "absolute", top: "100%", left: 0, right: 0,
            background: "#fff", borderBottom: "1.5px solid #0047AB",
            display: "flex", flexDirection: "column",
            padding: "1.5rem 1.5rem",
            zIndex: 2000, gap: "0",
          }}
        >
          {NAV_LINKS.map(l => (
            <button
              key={l.path}
              onClick={() => go(l.path)}
              style={{
                ...navBtn,
                textAlign: "left",
                padding: "0.85rem 0",
                borderBottom: "1px solid #f0f0f0",
                fontSize: "1.1rem",
              }}
            >
              {l.label}
            </button>
          ))}
          <button
            className="btn-cobalt font-sora"
            onClick={() => { signOut(); setOpen(false); }}
            style={{ marginTop: "1.2rem", width: "100%", letterSpacing: "0.12em" }}
          >
            Sign out
          </button>
        </nav>
      )}
    </header>
  );
}
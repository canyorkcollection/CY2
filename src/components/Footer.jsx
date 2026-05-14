import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Footer() {
  const [hovered, setHovered] = useState(false);
  const { session, signOut }  = useAuth();

  const linkStyle = (isHovered) => ({
    color: isHovered ? "#0047AB" : "#ccc",
    textDecoration: "none",
    transition: "color 0.2s ease",
    fontFamily: "'Sora', sans-serif",
    fontSize: "0.7rem",
    letterSpacing: "0.06em",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  });

  return (
    <footer style={{
      padding: "1.5rem 3.5rem",
      borderTop: "1px solid #f0f0f0",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      fontFamily: "'Sora', sans-serif",
      fontSize: "0.7rem", color: "#ccc",
      letterSpacing: "0.06em",
    }}>
      <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span>© 2025 Can York &nbsp;·&nbsp;&nbsp;</span>
        <Link
          to="/admin/login"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={linkStyle(hovered)}
        >
          Admin
        </Link>
      </span>

      {session && (
        <button
          onClick={signOut}
          onMouseEnter={e => e.currentTarget.style.color = "#0047AB"}
          onMouseLeave={e => e.currentTarget.style.color = "#ccc"}
          style={linkStyle(false)}
        >
          Sign out
        </button>
      )}
    </footer>
  );
}

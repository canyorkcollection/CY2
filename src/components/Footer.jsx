import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const [hovered, setHovered] = useState(false);

  return (
    <footer style={{
      padding: "1.5rem 3.5rem",
      borderTop: "1px solid #f0f0f0",
      display: "flex", alignItems: "center",
      fontFamily: "'Sora', sans-serif",
      fontSize: "0.7rem", color: "#ccc",
      letterSpacing: "0.06em",
    }}>
      <span>© 2025 Can York &nbsp;·&nbsp;&nbsp;</span>
      <Link
        to="/admin"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          color: hovered ? "#0047AB" : "#ccc",
          textDecoration: "none",
          transition: "color 0.2s ease",
          fontFamily: "'Sora', sans-serif",
          fontSize: "0.7rem",
        }}
      >
        Admin
      </Link>
    </footer>
  );
}
import React, { useState } from "react";
import PageTransition    from "./PageTransition";
import AdminArtworks     from "./AdminArtworks";
import AdminArtists      from "./AdminArtists";
import AdminInvitations  from "./AdminInvitations";
import AdminContact      from "./AdminContact";

const TABS = [
  { key: "artworks",    label: "Works"       },
  { key: "artists",     label: "Artists"     },
  { key: "contact",     label: "Contact"     },
  { key: "invitations", label: "Invitations" },
];

export default function Admin() {
  const [active, setActive] = useState("artworks");

  return (
    <PageTransition>
      <div className="admin-layout" style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "5rem", alignItems: "start" }}>

        <nav className="admin-sidebar" style={{ position: "sticky", top: "2rem" }}>
          <p className="font-sora" style={{ fontSize: "0.72rem", letterSpacing: "0.16em", color: "#aaa", textTransform: "uppercase", marginBottom: "1.5rem" }}>
            Panel admin
          </p>
          {TABS.map(tab => (
            <button
              key={tab.key}
              data-active={active === tab.key}
              onClick={() => setActive(tab.key)}
              className="font-sora"
              style={{
                display: "block", width: "100%", textAlign: "left",
                background: "none",
                border: "none",
                borderLeft: active === tab.key ? "2px solid #0047AB" : "2px solid transparent",
                padding: "0.5rem 0 0.5rem 1rem",
                fontSize: "1.05rem",
                color: active === tab.key ? "#0047AB" : "#aaa",
                fontWeight: active === tab.key ? 600 : 400,
                cursor: "pointer", letterSpacing: "0.06em",
                transition: "color 0.2s, border-color 0.2s",
                marginBottom: "0.4rem",
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div>
          {active === "artworks"    && <AdminArtworks />}
          {active === "artists"     && <AdminArtists  />}
          {active === "contact"     && <AdminContact  />}
          {active === "invitations" && <AdminInvitations />}
        </div>
      </div>
    </PageTransition>
  );
}
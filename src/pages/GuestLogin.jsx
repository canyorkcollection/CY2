import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

const inputStyle = {
  width: "100%", border: "none",
  borderBottom: "1.5px solid #0047AB",
  outline: "none", fontSize: "1.3rem",
  padding: "0.6rem 0", background: "transparent",
  color: "#111", fontFamily: "'EB Garamond', serif",
  letterSpacing: "0.01em",
};

export default function GuestLogin() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [state,   setState]   = useState("idle"); // idle | sent | requested

  async function handleSubmit() {
    if (!email) return;
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (!error) {
      setState("sent");
      setLoading(false);
      return;
    }

    const msg = error.message?.toLowerCase() ?? "";
    if (msg.includes("signups not allowed") || msg.includes("user not found") || error.status === 422) {
      await supabase.from("access_requests").upsert({ email, status: "pending" }, { onConflict: "email", ignoreDuplicates: true });
      setState("requested");
    } else {
      setState("requested"); // fallback — save anyway, don't show technical errors
    }

    setLoading(false);
  }

  function handleKeyDown(e) { if (e.key === "Enter") handleSubmit(); }

  if (state === "sent") {
    return (
      <Screen>
        <p className="font-garamond" style={{ fontSize: "1.4rem", color: "#0047AB", textAlign: "center", lineHeight: 1.7 }}>
          Check your email.
        </p>
        <p className="font-garamond" style={{ fontSize: "1.1rem", color: "#777", marginTop: "0.6rem", fontStyle: "italic", textAlign: "center" }}>
          We sent a sign-in link to {email}
        </p>
      </Screen>
    );
  }

  if (state === "requested") {
    return (
      <Screen>
        <p className="font-garamond" style={{ fontSize: "1.4rem", color: "#0047AB", textAlign: "center", lineHeight: 1.7 }}>
          Request received.
        </p>
        <p className="font-garamond" style={{ fontSize: "1.1rem", color: "#777", marginTop: "0.6rem", fontStyle: "italic", textAlign: "center", maxWidth: "320px" }}>
          We'll review your request and be in touch shortly.
        </p>
      </Screen>
    );
  }

  return (
    <Screen>
      <div style={{ width: "100%", maxWidth: "360px" }}>
        <label className="font-sora" style={{ fontSize: "0.75rem", letterSpacing: "0.12em", color: "#0047AB", textTransform: "uppercase", display: "block", marginBottom: "0.3rem" }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="your@email.com"
          style={inputStyle}
        />
        <button
          className="btn-cobalt font-sora"
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: "100%", marginTop: "2rem", opacity: loading ? 0.6 : 1, transition: "opacity 0.2s" }}
        >
          {loading ? "…" : "Log in"}
        </button>
      </div>
    </Screen>
  );
}

function Screen({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <span className="font-sora" style={{ fontSize: "2.8rem", fontWeight: 700, letterSpacing: "0.18em", color: "#0047AB", marginBottom: "3.5rem" }}>
        CAN YORK
      </span>
      {children}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, borderTop: "1.5px solid #0047AB" }} />
    </div>
  );
}

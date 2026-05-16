import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const ADMIN_EMAIL = "canyorkcollection@gmail.com";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const inputStyle = {
  width: "100%", border: "none",
  borderBottom: "1.5px solid #0047AB",
  outline: "none", fontSize: "1.3rem",
  padding: "0.6rem 0", background: "transparent",
  color: "#111", fontFamily: "'EB Garamond', serif",
  letterSpacing: "0.01em",
};

export default function GuestLogin() {
  const navigate  = useNavigate();
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [state,   setState]   = useState("idle"); // idle | requested | error

  async function handleSubmit() {
    if (!email) return;

    if (email.toLowerCase() === ADMIN_EMAIL) {
      navigate("/admin/login");
      return;
    }

    setLoading(true);

    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-magic-link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.token_hash) {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: data.token_hash,
        type: "magiclink",
      });

      if (!verifyError) {
        // Session established — AuthProvider will re-render the app automatically
        return;
      }

      setState("error");
      setLoading(false);
      return;
    }

    // not_invited or any other error → create access request
    await supabase.from("access_requests").insert({ email, status: "pending" });
    setState("requested");
    setLoading(false);
  }

  function handleKeyDown(e) { if (e.key === "Enter") handleSubmit(); }

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

  if (state === "error") {
    return (
      <Screen>
        <p className="font-garamond" style={{ fontSize: "1.1rem", color: "#777", textAlign: "center", maxWidth: "320px" }}>
          Something went wrong. Please try again.
        </p>
        <button
          className="btn-cobalt font-sora"
          onClick={() => { setState("idle"); setEmail(""); }}
          style={{ marginTop: "1.5rem" }}
        >
          Try again
        </button>
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

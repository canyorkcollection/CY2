import React, { useState } from "react";
import { Link } from "react-router-dom";
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
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState(null);

  async function handleSubmit() {
    if (!email) return;
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    setLoading(false);

    if (error) {
      const msg = error.message?.toLowerCase() ?? "";
      if (msg.includes("signups not allowed") || msg.includes("user not found")) {
        setError("This email has not been invited. Contact us to request access.");
      } else {
        setError("Couldn't send the link. Please try again.");
      }
    } else {
      setSent(true);
    }
  }

  function handleKeyDown(e) { if (e.key === "Enter") handleSubmit(); }

  if (sent) {
    return (
      <div style={{ minHeight: "100vh", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <span className="font-sora" style={{ fontSize: "2.8rem", fontWeight: 700, letterSpacing: "0.18em", color: "#0047AB", marginBottom: "2.5rem" }}>
          CAN YORK
        </span>
        <p className="font-garamond" style={{ fontSize: "1.4rem", color: "#0047AB", textAlign: "center", lineHeight: 1.7 }}>
          Check your email.
        </p>
        <p className="font-garamond" style={{ fontSize: "1.1rem", color: "#777", marginTop: "0.6rem", fontStyle: "italic", textAlign: "center" }}>
          We sent an access link to {email}
        </p>
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, borderTop: "1.5px solid #0047AB" }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <span className="font-sora" style={{ fontSize: "2.8rem", fontWeight: 700, letterSpacing: "0.18em", color: "#0047AB", marginBottom: "3.5rem" }}>
        CAN YORK
      </span>

      <div style={{ width: "100%", maxWidth: "380px" }}>

        <p className="font-garamond" style={{ fontSize: "1.2rem", color: "#444", marginBottom: "1.6rem", lineHeight: 1.6 }}>
          Already invited? Enter your email to sign in.
        </p>

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
          {loading ? "Sending…" : "Send sign-in link"}
        </button>

        {error && (
          <p className="font-sora" style={{ marginTop: "1.2rem", fontSize: "0.85rem", color: "#B22222", textAlign: "center", letterSpacing: "0.04em" }}>
            {error}
          </p>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "2.5rem 0" }}>
          <div style={{ flex: 1, height: "1px", background: "#e8e8e8" }} />
          <span className="font-sora" style={{ fontSize: "0.7rem", color: "#bbb", letterSpacing: "0.12em", textTransform: "uppercase" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "#e8e8e8" }} />
        </div>

        <p className="font-garamond" style={{ fontSize: "1.1rem", color: "#777", textAlign: "center", lineHeight: 1.7 }}>
          Don't have access yet?{" "}
          <Link to="/contact" style={{ color: "#0047AB", textDecoration: "none" }}>
            Contact us
          </Link>{" "}
          to request an invitation.
        </p>

      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, borderTop: "1.5px solid #0047AB" }} />
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const inputStyle = {
  width: "100%", border: "none",
  borderBottom: "1.5px solid #0047AB",
  outline: "none", fontSize: "1.2rem",
  padding: "0.6rem 0", background: "transparent",
  color: "#111", fontFamily: "'EB Garamond', serif",
};
const labelStyle = {
  display: "block", fontFamily: "'Sora', sans-serif",
  fontSize: "0.75rem", textTransform: "uppercase",
  letterSpacing: "0.12em", color: "#0047AB", marginBottom: "0.3rem",
};

export default function AdminLogin() {
  const navigate                      = useNavigate();
  const [searchParams]                = useSearchParams();
  const [email,        setEmail]      = useState("");
  const [password,     setPassword]   = useState("");
  const [newPassword,  setNewPassword]= useState("");
  const [loading,      setLoading]    = useState(false);
  const [error,        setError]      = useState(null);
  const [resetSent,    setResetSent]  = useState(false);
  const isRecovery = searchParams.get("recovery") === "true";

  // If arriving from password-recovery magic link, show new-password form
  useEffect(() => {
    if (isRecovery) setError(null);
  }, [isRecovery]);

  async function handleLogin() {
  if (!email || !password) return;
  setLoading(true);
  setError(null);

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  setLoading(false);

  if (error) {
    setError("Incorrect credentials.");
    return;
  }

  // Session exists — let App.jsx decide where to send based on isAdmin
  if (data.session) {
    navigate("/", { replace: true });
  }
}

  async function handleReset() {
    if (!email) { setError("Enter your email first."); return; }
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    setLoading(false);

    if (error) setError("Error sending recovery email.");
    else setResetSent(true);
  }

  async function handleNewPassword() {
    if (!newPassword) return;
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) setError("Error updating password.");
    else navigate("/admin", { replace: true });
  }

  function handleKeyDown(e) { if (e.key === "Enter") isRecovery ? handleNewPassword() : handleLogin(); }

  return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <span className="font-sora" style={{ fontSize: "2.8rem", fontWeight: 700, letterSpacing: "0.18em", color: "#0047AB", marginBottom: "1.2rem" }}>
        CAN YORK
      </span>
      <p className="font-garamond" style={{ fontSize: "1.1rem", color: "#aaa", marginBottom: "3.5rem", fontStyle: "italic" }}>
        {isRecovery ? "New password" : "Admin access"}
      </p>

      <div style={{ width: "100%", maxWidth: "360px" }}>

        {isRecovery ? (
          /* ── Password recovery form ── */
          <>
            <label style={labelStyle}>New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ ...inputStyle, marginBottom: "2rem" }}
            />
            <button
              className="btn-cobalt font-sora"
              onClick={handleNewPassword}
              disabled={loading}
              style={{ width: "100%", opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Saving…" : "Save password"}
            </button>
          </>
        ) : (
          /* ── Normal login form ── */
          <>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ ...inputStyle, marginBottom: "2rem" }}
            />

            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ ...inputStyle, marginBottom: "2.5rem" }}
            />

            <button
              className="btn-cobalt font-sora"
              onClick={handleLogin}
              disabled={loading}
              style={{ width: "100%", opacity: loading ? 0.6 : 1, marginBottom: "1.5rem" }}
            >
              {loading ? "Signing in…" : "Acceder"}
            </button>

            {resetSent ? (
              <p className="font-sora" style={{ fontSize: "0.8rem", color: "#0047AB", textAlign: "center", letterSpacing: "0.06em" }}>
                Recovery email sent.
              </p>
            ) : (
              <button
                onClick={handleReset}
                disabled={loading}
                className="font-sora"
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: "0.78rem", color: "#bbb", letterSpacing: "0.08em",
                  textTransform: "uppercase", display: "block", margin: "0 auto",
                  transition: "color 0.2s",
                }}
                onMouseEnter={e => e.target.style.color = "#0047AB"}
                onMouseLeave={e => e.target.style.color = "#bbb"}
              >
                Forgot your password?
              </button>
            )}
          </>
        )}

        {error && (
          <p className="font-sora" style={{ marginTop: "1.2rem", fontSize: "0.82rem", color: "#B22222", textAlign: "center", letterSpacing: "0.04em" }}>
            {error}
          </p>
        )}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, borderTop: "1.5px solid #0047AB" }} />
    </div>
  );
}
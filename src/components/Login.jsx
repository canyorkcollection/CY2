import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [email,   setEmail]   = useState("");
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email) return;
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSubmit();
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#fff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
    }}>

      {/* Logo */}
      <span className="font-sora" style={{
        fontSize: "3.2rem",
        fontWeight: 700,
        letterSpacing: "0.18em",
        color: "#0047AB",
        marginBottom: "1.2rem",
      }}>
        CAN YORK
      </span>

      {/* Subtítulo */}
      <p className="font-garamond" style={{
        fontSize: "1.3rem",
        color: "#444",
        marginBottom: "3.5rem",
        fontStyle: "italic",
      }}>
        Acceso exclusivo a la colección
      </p>

      {/* Formulario */}
      <div style={{ width: "100%", maxWidth: "380px" }}>

        {!sent ? (
          <>
            {/* Input email minimalista */}
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="font-garamond"
              style={{
                width: "100%",
                border: "none",
                borderBottom: "1.5px solid #0047AB",
                outline: "none",
                fontSize: "1.4rem",
                padding: "0.6rem 0",
                marginBottom: "2.5rem",
                background: "transparent",
                color: "#111",
                letterSpacing: "0.02em",
              }}
            />

            <button
              className="btn-cobalt font-sora"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: "100%",
                opacity: loading ? 0.6 : 1,
                transition: "opacity 0.2s",
              }}
            >
              {loading ? "Enviando…" : "Solicitar acceso"}
            </button>

            {/* Error */}
            {error && (
              <p className="font-garamond" style={{
                marginTop: "1.2rem",
                fontSize: "1.1rem",
                color: "#B22222",
                textAlign: "center",
              }}>
                {error}
              </p>
            )}
          </>
        ) : (
          /* Estado de éxito */
          <p className="font-garamond" style={{
            fontSize: "1.3rem",
            color: "#0047AB",
            textAlign: "center",
            lineHeight: 1.7,
          }}>
            Revisa tu bandeja de entrada.
          </p>
        )}
      </div>

      {/* Línea decorativa inferior */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: "1.5px solid #0047AB",
      }} />
    </div>
  );
}
import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Footer from "./Footer";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    setLoading(false);

    if (error) {
      // Si el error es porque los registros están bloqueados, significa que no está invitado
      if (error.message.includes("Signups not allowed") || error.status === 422) {
        setMessage({ type: "err", text: "Este email no está invitado. Debes recibir un enlace de acceso exclusivo." });
      } else {
        setMessage({ type: "err", text: "Ocurrió un error. Inténtalo de nuevo." });
      }
    } else {
      setMessage({ type: "ok", text: "Enlace de acceso enviado. Revisa tu bandeja de entrada." });
      setEmail("");
    }
  }

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      minHeight: "80vh", 
      padding: "2rem" 
    }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <h1 className="font-garamond" style={{ fontSize: "2rem", color: "#0047AB", marginBottom: "0.5rem", textAlign: "center" }}>
          Acceso Privado
        </h1>
        <p className="font-sora" style={{ fontSize: "0.8rem", color: "#999", textAlign: "center", marginBottom: "3rem" }}>
          Una selección restringida de arte contemporáneo.
        </p>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Tu email"
              required
              disabled={loading}
              className="font-sora"
              style={{
                width: "100%",
                border: "none",
                borderBottom: "1.5px solid #0047AB",
                outline: "none",
                fontSize: "1.1rem",
                padding: "0.75rem 0",
                background: "transparent",
                color: "#111",
                fontFamily: "'Sora', sans-serif",
                textAlign: "center",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-cobalt font-sora"
            style={{ width: "100%", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Enviando..." : "Solicitar acceso"}
          </button>
        </form>

        {message && (
          <p 
            className="font-sora" 
            style={{ 
              marginTop: "1.5rem", 
              fontSize: "0.85rem", 
              textAlign: "center",
              lineHeight: 1.6,
              color: message.type === "ok" ? "#0047AB" : "#B22222" 
            }}
          >
            {message.text}
          </p>
        )}

        <p className="font-sora" style={{ marginTop: "4rem", fontSize: "0.75rem", color: "#bbb", textAlign: "center", lineHeight: 1.6 }}>
          ¿Ya fuiste invitado? Introduce tu email para recibir el enlace de acceso mágico.
        </p>
      </div>
    </div>
  );
}
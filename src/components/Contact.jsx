import React, { useState } from "react";
import PageTransition from "./PageTransition";

const FORMSPREE_URL = "https://formspree.io/f/mlgzllpj";

export default function Contact() {
  const [fields,  setFields]  = useState({ name: "", email: "", message: "" });
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFields(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit() {
    if (!fields.name || !fields.email || !fields.message) {
      setError("Por favor, completa todos los campos.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(FORMSPREE_URL, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body:    JSON.stringify(fields),
      });

      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data?.errors?.[0]?.message ?? "Error al enviar. Inténtalo de nuevo.");
      }
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    }

    setLoading(false);
  }

  const inputStyle = {
    width:        "100%",
    border:       "none",
    borderBottom: "1.5px solid #0047AB",
    outline:      "none",
    fontSize:     "1.3rem",
    padding:      "0.6rem 0",
    marginBottom: "2.5rem",
    background:   "transparent",
    color:        "#111",
    fontFamily:   "'EB Garamond', serif",
    letterSpacing: "0.01em",
    resize:       "none",
  };

  return (
    <PageTransition>
      <div style={{
        display:             "grid",
        gridTemplateColumns: "1fr 1fr",
        gap:                 "6rem",
        alignItems:          "start",
      }}>

        {/* COLUMNA IZQUIERDA */}
        <div>
          <h1 className="font-sora" style={{ fontSize: "2.8rem", fontWeight: 700, lineHeight: 1.1, marginBottom: "2rem" }}>
            Hablemos sobre la colección.
          </h1>

          <hr className="cobalt-line" />

          <p className="font-garamond" style={{ fontSize: "1.4rem", color: "#0047AB", margin: "1.8rem 0 0.4rem", letterSpacing: "0.04em" }}>
            Ibiza, España
          </p>
          <p className="font-garamond" style={{ fontSize: "1.15rem", color: "#777", lineHeight: 1.7, marginBottom: "2.5rem" }}>
            Can York es una colección privada. Las obras no se exhiben públicamente. El acceso es por invitación, y cada conversación es tratada con la misma discreción que la propia colección.
          </p>

          <hr className="cobalt-line" />

          <p className="font-garamond" style={{ fontSize: "1.1rem", color: "#aaa", lineHeight: 1.8, marginTop: "1.5rem", fontStyle: "italic" }}>
            "La privacidad no es secreto.<br />Es la condición necesaria para que el arte respire."
          </p>
        </div>

        {/* COLUMNA DERECHA — Formulario */}
        <div style={{ paddingTop: "0.5rem" }}>

          {!sent ? (
            <>
              <div>
                <label className="font-sora" style={{ fontSize: "0.8rem", letterSpacing: "0.12em", color: "#0047AB", textTransform: "uppercase" }}>
                  Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  value={fields.name}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="font-sora" style={{ fontSize: "0.8rem", letterSpacing: "0.12em", color: "#0047AB", textTransform: "uppercase" }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={fields.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="font-sora" style={{ fontSize: "0.8rem", letterSpacing: "0.12em", color: "#0047AB", textTransform: "uppercase" }}>
                  Mensaje
                </label>
                <textarea
                  name="message"
                  value={fields.message}
                  onChange={handleChange}
                  placeholder="¿En qué podemos ayudarte?"
                  rows={5}
                  style={inputStyle}
                />
              </div>

              <button
                className="btn-cobalt font-sora"
                onClick={handleSubmit}
                disabled={loading}
                style={{ opacity: loading ? 0.6 : 1, transition: "opacity 0.2s" }}
              >
                {loading ? "Enviando…" : "Enviar mensaje"}
              </button>

              {error && (
                <p className="font-garamond" style={{ marginTop: "1.2rem", fontSize: "1.1rem", color: "#B22222" }}>
                  {error}
                </p>
              )}
            </>
          ) : (
            <div style={{ paddingTop: "1rem" }}>
              <p className="font-garamond" style={{ fontSize: "1.4rem", color: "#0047AB", lineHeight: 1.7 }}>
                Mensaje enviado.
              </p>
              <p className="font-garamond" style={{ fontSize: "1.2rem", color: "#555", marginTop: "0.8rem", lineHeight: 1.7, fontStyle: "italic" }}>
                Te responderemos con la misma discreción con la que cuidas tu colección.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
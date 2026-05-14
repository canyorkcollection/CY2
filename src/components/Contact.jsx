import React, { useState, useEffect } from "react";
import PageTransition from "./PageTransition";
import { supabase } from "../lib/supabaseClient";

const FORMSPREE_URL = "https://formspree.io/f/mlgzllpj";

const DEFAULT_CONTENT = {
  headline:    "Let's talk about the collection.",
  location:    "Ibiza, Spain",
  description: "Can York is a private collection. Works are not publicly exhibited. Access is by invitation, and every conversation is treated with the same discretion as the collection itself.",
  quote:       "Privacy is not secrecy. It is the necessary condition for art to breathe.",
  hero_images: [],
};

function HeroSlider({ images }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setCurrent(i => (i + 1) % images.length), 4500);
    return () => clearInterval(t);
  }, [images.length]);

  if (!images.length) return null;

  return (
    <div style={{ position: "relative", width: "100%", height: "65vh", overflow: "hidden", marginBottom: "4.5rem" }}>
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%", objectFit: "cover",
            opacity: i === current ? 1 : 0,
            transition: "opacity 1.2s ease",
          }}
        />
      ))}
      {images.length > 1 && (
        <div style={{
          position: "absolute", bottom: "1.5rem", left: "50%",
          transform: "translateX(-50%)", display: "flex", gap: "0.5rem",
        }}>
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: "7px", height: "7px", borderRadius: "50%",
                border: "none", padding: 0, cursor: "pointer",
                background: i === current ? "#fff" : "rgba(255,255,255,0.4)",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Contact() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [fields,  setFields]  = useState({ name: "", email: "", message: "" });
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase
      .from("site_content")
      .select("data")
      .eq("key", "contact")
      .single()
      .then(({ data: row }) => {
        if (row?.data) setContent({ ...DEFAULT_CONTENT, ...row.data });
      });
  }, []);

  function handleChange(e) {
    setFields(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit() {
    if (!fields.name || !fields.email || !fields.message) {
      setError("Please complete all fields.");
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
        setError(data?.errors?.[0]?.message ?? "Error sending. Please try again.");
      }
    } catch {
      setError("Connection error. Please try again.");
    }
    setLoading(false);
  }

  const inputStyle = {
    width: "100%", border: "none", borderBottom: "1.5px solid #0047AB",
    outline: "none", fontSize: "1.3rem", padding: "0.6rem 0", marginBottom: "2.5rem",
    background: "transparent", color: "#111", fontFamily: "'EB Garamond', serif",
    letterSpacing: "0.01em", resize: "none",
  };

  return (
    <PageTransition>
      <HeroSlider images={content.hero_images} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6rem", alignItems: "start" }}>

        {/* Left: editable text */}
        <div>
          <h1 className="font-sora" style={{ fontSize: "2.8rem", fontWeight: 700, lineHeight: 1.1, marginBottom: "2rem" }}>
            {content.headline}
          </h1>

          <hr className="cobalt-line" />

          <p className="font-garamond" style={{ fontSize: "1.4rem", color: "#0047AB", margin: "1.8rem 0 0.4rem", letterSpacing: "0.04em" }}>
            {content.location}
          </p>
          <p className="font-garamond" style={{ fontSize: "1.15rem", color: "#777", lineHeight: 1.7, marginBottom: "2.5rem" }}>
            {content.description}
          </p>

          <hr className="cobalt-line" />

          <p className="font-garamond" style={{ fontSize: "1.1rem", color: "#aaa", lineHeight: 1.8, marginTop: "1.5rem", fontStyle: "italic" }}>
            "{content.quote}"
          </p>
        </div>

        {/* Right: form */}
        <div style={{ paddingTop: "0.5rem" }}>
          {!sent ? (
            <>
              <div>
                <label className="font-sora" style={{ fontSize: "0.8rem", letterSpacing: "0.12em", color: "#0047AB", textTransform: "uppercase" }}>
                  Name
                </label>
                <input type="text" name="name" value={fields.name} onChange={handleChange} placeholder="Your name" style={inputStyle} />
              </div>

              <div>
                <label className="font-sora" style={{ fontSize: "0.8rem", letterSpacing: "0.12em", color: "#0047AB", textTransform: "uppercase" }}>
                  Email
                </label>
                <input type="email" name="email" value={fields.email} onChange={handleChange} placeholder="your@email.com" style={inputStyle} />
              </div>

              <div>
                <label className="font-sora" style={{ fontSize: "0.8rem", letterSpacing: "0.12em", color: "#0047AB", textTransform: "uppercase" }}>
                  Message
                </label>
                <textarea name="message" value={fields.message} onChange={handleChange} placeholder="How can we help you?" rows={5} style={inputStyle} />
              </div>

              <button
                className="btn-cobalt font-sora"
                onClick={handleSubmit}
                disabled={loading}
                style={{ opacity: loading ? 0.6 : 1, transition: "opacity 0.2s" }}
              >
                {loading ? "Sending…" : "Send message"}
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
                Message sent.
              </p>
              <p className="font-garamond" style={{ fontSize: "1.2rem", color: "#555", marginTop: "0.8rem", lineHeight: 1.7, fontStyle: "italic" }}>
                We will reply with the same discretion with which you care for your collection.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

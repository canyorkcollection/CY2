import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

const inp = {
  width: "100%", border: "none", borderBottom: "1.5px solid #0047AB",
  outline: "none", fontSize: "1.1rem", padding: "0.5rem 0", marginBottom: "1.8rem",
  background: "transparent", color: "#111", fontFamily: "'Sora', sans-serif", resize: "none",
};
const lbl = {
  fontSize: "0.75rem", letterSpacing: "0.12em", color: "#0047AB",
  textTransform: "uppercase", fontFamily: "'Sora', sans-serif",
  display: "block", marginBottom: "0.25rem",
};

const DEFAULT = {
  headline:    "Let's talk about the collection.",
  location:    "Ibiza, Spain",
  description: "Can York is a private collection. Works are not publicly exhibited. Access is by invitation, and every conversation is treated with the same discretion as the collection itself.",
  quote:       "Privacy is not secrecy. It is the necessary condition for art to breathe.",
  hero_images: [],
};

export default function AdminContact() {
  const [data,    setData]    = useState(DEFAULT);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => { fetchContent(); }, []);

  async function fetchContent() {
    const { data: row } = await supabase
      .from("site_content")
      .select("data")
      .eq("key", "contact")
      .single();
    if (row?.data) setData({ ...DEFAULT, ...row.data });
  }

  function setField(key, value) {
    setData(prev => ({ ...prev, [key]: value }));
  }

  async function saveData(newData) {
    return supabase
      .from("site_content")
      .upsert({ key: "contact", data: newData }, { onConflict: "key" });
  }

  async function handleSaveText() {
    setLoading(true);
    const { error } = await saveData(data);
    setLoading(false);
    flash(error ? "Error saving." : "Saved.");
  }

  async function handleUploadImages(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setLoading(true);
    const urls = [];
    for (const file of files) {
      const path = `contact/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("site").upload(path, file);
      if (!upErr) {
        const { data: { publicUrl } } = supabase.storage.from("site").getPublicUrl(path);
        urls.push(publicUrl);
      }
    }
    const newData = { ...data, hero_images: [...data.hero_images, ...urls] };
    setData(newData);
    await saveData(newData);
    setLoading(false);
    flash(`${urls.length} image${urls.length !== 1 ? "s" : ""} uploaded.`);
    e.target.value = "";
  }

  async function removeImage(url) {
    const newData = { ...data, hero_images: data.hero_images.filter(u => u !== url) };
    setData(newData);
    await saveData(newData);
  }

  function flash(msg) {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  }

  return (
    <div>
      <h2 className="font-sora" style={{ fontSize: "1.4rem", fontWeight: 600, marginBottom: "2.5rem" }}>
        Contact page
      </h2>

      {/* Text fields */}
      <div style={{ maxWidth: "560px", marginBottom: "3.5rem" }}>
        <label style={lbl}>Headline</label>
        <input
          style={inp}
          value={data.headline}
          onChange={e => setField("headline", e.target.value)}
        />

        <label style={lbl}>Location</label>
        <input
          style={inp}
          value={data.location}
          onChange={e => setField("location", e.target.value)}
        />

        <label style={lbl}>Description</label>
        <textarea
          rows={4}
          style={inp}
          value={data.description}
          onChange={e => setField("description", e.target.value)}
        />

        <label style={lbl}>Quote</label>
        <textarea
          rows={3}
          style={inp}
          value={data.quote}
          onChange={e => setField("quote", e.target.value)}
        />

        <button
          className="btn-cobalt font-sora"
          onClick={handleSaveText}
          disabled={loading}
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "Saving…" : "Save text"}
        </button>
      </div>

      {/* Hero images */}
      <div>
        <p style={{ ...lbl, marginBottom: "1.2rem", fontSize: "0.8rem" }}>Hero images</p>

        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleUploadImages}
        />
        <button
          className="btn-cobalt font-sora"
          onClick={() => fileRef.current?.click()}
          disabled={loading}
          style={{ marginBottom: "1.8rem", opacity: loading ? 0.6 : 1 }}
        >
          Upload images
        </button>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          {data.hero_images.map((url, i) => (
            <div key={i} style={{ position: "relative", width: "180px", height: "120px", flexShrink: 0 }}>
              <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <button
                onClick={() => removeImage(url)}
                style={{
                  position: "absolute", top: "6px", right: "6px",
                  background: "rgba(0,0,0,0.55)", border: "none", color: "#fff",
                  width: "22px", height: "22px", borderRadius: "50%",
                  cursor: "pointer", fontSize: "0.65rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >✕</button>
            </div>
          ))}
          {data.hero_images.length === 0 && (
            <p className="font-garamond" style={{ color: "#bbb", fontSize: "1.1rem" }}>No images yet.</p>
          )}
        </div>
      </div>

      {message && (
        <p className="font-sora" style={{ marginTop: "1.8rem", fontSize: "0.85rem", color: "#0047AB", letterSpacing: "0.06em" }}>
          {message}
        </p>
      )}
    </div>
  );
}

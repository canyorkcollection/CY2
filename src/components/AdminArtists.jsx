import React, { useState, useEffect } from "react";
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

function ConfirmModal({ text, onConfirm, onCancel }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    }}>
      <div style={{ background: "#fff", padding: "2.5rem 3rem", maxWidth: "420px", width: "90%" }}>
        <p className="font-sora" style={{ fontSize: "1.1rem", marginBottom: "2rem", lineHeight: 1.6 }}>{text}</p>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <button className="btn-cobalt font-sora" onClick={onConfirm}>Confirmar</button>
          <button onClick={onCancel} className="font-sora"
            style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: "1rem" }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

const EMPTY = { name: "", bio: "" };

export default function AdminArtists() {
  const [artists,   setArtists]   = useState([]);
  const [fields,    setFields]    = useState(EMPTY);
  const [file,      setFile]      = useState(null);
  const [preview,   setPreview]   = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [message,   setMessage]   = useState(null);
  const [modal,     setModal]     = useState(null);

  useEffect(() => { fetchArtists(); }, []);

  async function fetchArtists() {
    const { data } = await supabase.from("artists").select("*").order("name");
    if (data) setArtists(data);
  }

  const handleChange = e => setFields(p => ({ ...p, [e.target.name]: e.target.value }));

  function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function uploadPhoto() {
    const ext      = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("artists").upload(fileName, file, { cacheControl: "3600", upsert: false });
    if (error) throw new Error(`Error subiendo foto: ${error.message}`);
    const { data: { publicUrl } } = supabase.storage.from("artists").getPublicUrl(fileName);
    return { publicUrl, fileName };
  }

  async function deleteOldPhoto(photoUrl) {
    if (!photoUrl) return;
    const match = photoUrl.match(/artists\/(.+)$/);
    if (match) await supabase.storage.from("artists").remove([decodeURIComponent(match[1])]);
  }

  async function handleSave() {
    if (!fields.name) { setMessage({ type: "err", text: "El nombre es obligatorio." }); return; }
    setLoading(true);
    setMessage(null);

    try {
      if (editingId) {
        let photo_url = undefined;
        if (file) {
          const existing = artists.find(a => a.id === editingId);
          await deleteOldPhoto(existing?.photo_url);
          const { publicUrl } = await uploadPhoto();
          photo_url = publicUrl;
        }
        const payload = { ...fields, ...(photo_url !== undefined && { photo_url }) };
        const { error } = await supabase.from("artists").update(payload).eq("id", editingId);
        if (error) throw new Error(error.message);
        setMessage({ type: "ok", text: "Artista actualizado." });
      } else {
        let photo_url = null;
        if (file) { const { publicUrl } = await uploadPhoto(); photo_url = publicUrl; }
        const { error } = await supabase.from("artists").insert({ ...fields, photo_url });
        if (error) throw new Error(error.message);
        setMessage({ type: "ok", text: "Artista guardado." });
      }
      resetForm();
      fetchArtists();
    } catch (err) {
      setMessage({ type: "err", text: err.message });
    }
    setLoading(false);
  }

  function startEdit(artist) {
    setEditingId(artist.id);
    setFields({ name: artist.name ?? "", bio: artist.bio ?? "" });
    setFile(null);
    setPreview(artist.photo_url ?? null);
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function askDelete(artist) { setModal({ artistId: artist.id, photoUrl: artist.photo_url, name: artist.name }); }

  async function confirmDelete() {
    const { artistId, photoUrl } = modal;
    setModal(null);
    await deleteOldPhoto(photoUrl);
    await supabase.from("artists").delete().eq("id", artistId);
    fetchArtists();
  }

  function resetForm() { setEditingId(null); setFields(EMPTY); setFile(null); setPreview(null); }

  return (
    <div>
      <p className="font-sora" style={{ fontSize: "0.8rem", color: "#999", marginBottom: "2rem", lineHeight: 1.6 }}>
        Añade los artistas que representa la galería.
      </p>

      <h2 className="font-sora" style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "2.5rem" }}>
        {editingId ? "Editar artista" : "Nuevo artista"}
      </h2>

      <div className="admin-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 3rem" }}>
        <div>
          <label style={lbl}>Nombre *</label>
          <input style={inp} name="name" value={fields.name} onChange={handleChange} placeholder="Marta Solà" />

          <label style={lbl}>Biografía</label>
          <textarea style={inp} name="bio" value={fields.bio} onChange={handleChange} rows={6} placeholder="Texto biográfico…" />
        </div>

        <div>
          <label style={lbl}>Fotografía {editingId && "(sube una nueva para reemplazar)"}</label>
          <input type="file" accept="image/*" onChange={handleFile}
            style={{ marginBottom: "1.2rem", fontFamily: "'Sora', sans-serif", fontSize: "0.9rem", color: "#555" }} />
          {preview && (
            <div style={{ border: "1.5px solid #0047AB", overflow: "hidden", height: "220px", marginBottom: "1.5rem" }}>
              <img src={preview} alt="previsualización" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
        <button className="btn-cobalt font-sora" onClick={handleSave} disabled={loading} style={{ opacity: loading ? 0.6 : 1 }}>
          {loading ? "Guardando…" : editingId ? "Guardar cambios" : "Guardar artista"}
        </button>
        {editingId && (
          <button onClick={resetForm} className="font-sora"
            style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: "0.95rem" }}>
            Cancelar edición
          </button>
        )}
      </div>

      {message && (
        <p className="font-sora" style={{ marginTop: "1rem", fontSize: "0.95rem", color: message.type === "ok" ? "#0047AB" : "#B22222" }}>
          {message.text}
        </p>
      )}

      {/* List */}
      <hr className="cobalt-line" style={{ marginTop: "3.5rem" }} />
      <h2 className="font-sora" style={{ fontSize: "1.3rem", fontWeight: 600, margin: "2rem 0 1.5rem" }}>
        Artistas registrados ({artists.length})
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
        {artists.map(a => (
          <div key={a.id} style={{ display: "flex", alignItems: "center", gap: "1.5rem", borderBottom: "1px solid #f0f0f0", paddingBottom: "0.8rem" }}>
            <div style={{ width: "64px", height: "64px", border: "1.5px solid #e0e0e0", overflow: "hidden", flexShrink: 0, background: "#f5f5f5" }}>
              {a.photo_url
                ? <img src={a.photo_url} alt={a.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "0.7rem", color: "#bbb", fontFamily: "'Sora', sans-serif" }}>—</span>
                  </div>
              }
            </div>
            <div style={{ flex: 1 }}>
              <p className="font-sora" style={{ fontSize: "0.95rem", fontWeight: 600 }}>{a.name}</p>
              <p className="font-sora" style={{ fontSize: "0.85rem", color: "#999" }}>
                {a.bio?.slice(0, 80)}{a.bio?.length > 80 ? "…" : ""}
              </p>
            </div>
            <button onClick={() => startEdit(a)} className="font-sora"
              style={{ background: "none", border: "none", color: "#0047AB", cursor: "pointer", fontSize: "0.85rem", letterSpacing: "0.06em" }}>
              Editar
            </button>
            <button onClick={() => askDelete(a)} className="font-sora"
              style={{ background: "none", border: "none", color: "#B22222", cursor: "pointer", fontSize: "0.85rem", letterSpacing: "0.06em" }}>
              Borrar
            </button>
          </div>
        ))}
      </div>

      {modal && (
        <ConfirmModal
          text={`¿Eliminar al artista "${modal.name}"? Esta acción no se puede deshacer.`}
          onConfirm={confirmDelete}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  );
}
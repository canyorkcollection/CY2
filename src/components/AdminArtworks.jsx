import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

/* ── shared styles ── */
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

/* ── confirmation modal ── */
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

const EMPTY = { title: "", year: "", technique: "", dimensions: "", description: "", artist_id: "" };

export default function AdminArtworks() {
  const [artists,      setArtists]      = useState([]);
  const [artworks,     setArtworks]     = useState([]);
  const [fields,       setFields]       = useState(EMPTY);
  const [files,        setFiles]        = useState([]);
  const [editingId,    setEditingId]    = useState(null);
  const [filterArtist, setFilterArtist] = useState("");
  const [loading,      setLoading]      = useState(false);
  const [message,      setMessage]      = useState(null);
  const [modal,        setModal]        = useState(null);

  /* ── drag refs & visual state ── */
  const dragItem     = useRef(null);
  const dragOverItem = useRef(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    const [{ data: a }, { data: w }] = await Promise.all([
      supabase.from("artists").select("*").order("name"),
      supabase.from("artworks").select("*, artists(name)").order("title"),
    ]);
    if (a) setArtists(a);
    if (w) setArtworks(w);
  }

  const handleChange = e => setFields(p => ({ ...p, [e.target.name]: e.target.value }));

  function handleFiles(e) {
    const selected = Array.from(e.target.files).map(f => ({ file: f, previewUrl: URL.createObjectURL(f) }));
    setFiles(p => [...p, ...selected]);
    e.target.value = "";
  }
  function removeFile(idx) { setFiles(p => p.filter((_, i) => i !== idx)); }

  /* ── drag handlers ── */
  function onDragStart(e, idx) {
    dragItem.current = idx;
    e.dataTransfer.effectAllowed = "move";
  }
  function onDragOver(e) {
    e.preventDefault(); // required to allow drop — nothing else here
  }
  function onDragEnter(idx) {
    dragOverItem.current = idx;
    setDragOverIdx(idx);
  }
  function onDragLeave() {
    setDragOverIdx(null);
  }
  function onDrop() {
    const from = dragItem.current;
    const to   = dragOverItem.current;
    if (from !== null && to !== null && from !== to) {
      setFiles(prev => {
        const next = [...prev];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return next;
      });
    }
    dragItem.current     = null;
    dragOverItem.current = null;
    setDragOverIdx(null);
  }
  function onDragEnd() {
    dragItem.current     = null;
    dragOverItem.current = null;
    setDragOverIdx(null);
  }

  /* ── upload helpers ── */
  async function uploadFiles(folder) {
    const urls = [];
    for (let i = 0; i < files.length; i++) {
      const { file } = files[i];
      const ext  = file.name.split(".").pop();
      const path = `${folder}/imagen-${i}.${ext}`;
      const { error } = await supabase.storage.from("artworks").upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw new Error(`Error subiendo imagen ${i + 1}: ${error.message}`);
      const { data: { publicUrl } } = supabase.storage.from("artworks").getPublicUrl(path);
      urls.push(publicUrl);
    }
    return urls;
  }

  async function deleteFolder(folderPath) {
    const { data: list } = await supabase.storage.from("artworks").list(folderPath);
    if (list?.length) {
      const paths = list.map(f => `${folderPath}/${f.name}`);
      await supabase.storage.from("artworks").remove(paths);
    }
  }

  /* ── save ── */
  async function handleSave() {
    if (!fields.title || !fields.artist_id) {
      setMessage({ type: "err", text: "Título y artista son obligatorios." });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      if (editingId) {
        /* UPDATE */
        let images = undefined;
        let imageUrl = undefined;

        if (files.length > 0) {
          // Intentar borrar imágenes antiguas sin romper el flujo si falla
          try {
            const existing = artworks.find(a => a.id === editingId);
            if (existing?.images?.length) {
              const oldUrl = existing.images[0];
              const match  = oldUrl.match(/\/artworks\/(.+)\//); // Regex ligeramente más segura
              if (match) await deleteFolder(match[1]);
            }
          } catch (deleteErr) {
            console.warn("No se pudieron borrar las imágenes antiguas:", deleteErr.message);
          }

          const folder = `obra-${Date.now()}`;
          const urls   = await uploadFiles(folder);
          images   = urls;
          imageUrl = urls[0];
        }

        const payload = { ...fields };
        if (images !== undefined) {
          payload.images     = images;
          payload.image_url  = imageUrl;
        }

        const { error } = await supabase.from("artworks").update(payload).eq("id", editingId);
        if (error) throw new Error(error.message);
        setMessage({ type: "ok", text: "Obra actualizada." });

      } else {
        /* INSERT */
        if (files.length === 0) { setMessage({ type: "err", text: "Sube al menos una imagen." }); setLoading(false); return; }
        const folder = `obra-${Date.now()}`;
        const urls   = await uploadFiles(folder);
        const { error } = await supabase.from("artworks").insert({ ...fields, images: urls, image_url: urls[0] });
        if (error) throw new Error(error.message);
        setMessage({ type: "ok", text: "Obra guardada." });
      }
      resetForm();
      fetchAll();
    } catch (err) {
      setMessage({ type: "err", text: err.message });
    }
    setLoading(false);
  }

  function startEdit(art) {
    setEditingId(art.id);
    setFields({
      title:       art.title       ?? "",
      year:        art.year        ?? "",
      technique:   art.technique   ?? "",
      dimensions:  art.dimensions  ?? "",
      description: art.description ?? "",
      artist_id:   art.artist_id   ?? "",
    });
    setFiles([]);
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function askDelete(art) {
    const match = art.images?.[0]?.match(/\/artworks\/(.+)\//);
    setModal({ artworkId: art.id, folderPath: match ? match[1] : null, title: art.title });
  }

  async function confirmDelete() {
    const { artworkId, folderPath } = modal;
    setModal(null);
    if (folderPath) await deleteFolder(folderPath);
    await supabase.from("artworks").delete().eq("id", artworkId);
    fetchAll();
  }

  function resetForm() { setEditingId(null); setFields(EMPTY); setFiles([]); }

  const filtered = filterArtist ? artworks.filter(a => a.artist_id === filterArtist) : artworks;

  return (
    <div>
      <p className="font-sora" style={{ fontSize: "0.8rem", color: "#999", marginBottom: "2rem", lineHeight: 1.6 }}>
        Sube las imágenes de la obra. La primera será la foto principal y las demás close-ups. Puedes arrastrar para reordenar.
      </p>

      <h2 className="font-sora" style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "2.5rem" }}>
        {editingId ? "Editar obra" : "Nueva obra"}
      </h2>

      <div className="admin-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 3rem" }}>
        <div>
          <label style={lbl}>Título *</label>
          <input style={inp} name="title" value={fields.title} onChange={handleChange} placeholder="Resonancia Ígnea" />

          <label style={lbl}>Año</label>
          <input style={inp} name="year" value={fields.year} onChange={handleChange} placeholder="2021" />

          <label style={lbl}>Técnica</label>
          <input style={inp} name="technique" value={fields.technique} onChange={handleChange} placeholder="Óleo sobre lienzo" />

          <label style={lbl}>Medidas</label>
          <input style={inp} name="dimensions" value={fields.dimensions} onChange={handleChange} placeholder="180 × 240 cm" />

          <label style={lbl}>Artista *</label>
          <select name="artist_id" value={fields.artist_id} onChange={handleChange} style={{ ...inp, cursor: "pointer" }}>
            <option value="">— Selecciona un artista —</option>
            {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        <div>
          <label style={lbl}>Descripción</label>
          <textarea style={{ ...inp, marginBottom: "1.8rem" }} name="description" value={fields.description}
            onChange={handleChange} rows={5} placeholder="Texto descriptivo…" />

          <label style={lbl}>Imágenes {editingId ? "(sube nuevas para reemplazar)" : "*"}</label>
          <input type="file" accept="image/*" multiple onChange={handleFiles}
            style={{ marginBottom: "1.2rem", fontFamily: "'Sora', sans-serif", fontSize: "0.9rem", color: "#555" }} />

          {/* ── Thumbnail strip ── */}
          {files.length > 0 && (
            <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
              {files.map((f, i) => (
                <div
                  key={i}
                  draggable
                  onDragStart={e => onDragStart(e, i)}
                  onDragOver={onDragOver}
                  onDragEnter={() => onDragEnter(i)}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onDragEnd={onDragEnd}
                  style={{ position: "relative", cursor: "grab", userSelect: "none" }}
                >
                  <div style={{
                    width: "80px",
                    height: "80px",
                    overflow: "hidden",
                    border: dragOverIdx === i
                      ? "2px dashed #0047AB"
                      : i === 0
                        ? "2px solid #0047AB"
                        : "1.5px solid #e0e0e0",
                  }}>
                    <img src={f.previewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                  {i === 0 && dragOverIdx !== 0 && (
                    <span className="font-sora" style={{
                      position: "absolute", bottom: 0, left: 0, right: 0,
                      background: "#0047AB", color: "#fff", fontSize: "0.6rem",
                      textAlign: "center", padding: "2px 0", letterSpacing: "0.08em",
                    }}>PRINCIPAL</span>
                  )}
                  <button onClick={() => removeFile(i)} style={{
                    position: "absolute", top: "-8px", right: "-8px",
                    background: "#fff", border: "1.5px solid #0047AB", color: "#0047AB",
                    width: "20px", height: "20px", cursor: "pointer",
                    fontSize: "0.7rem", display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Sora', sans-serif", lineHeight: 1,
                  }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
        <button className="btn-cobalt font-sora" onClick={handleSave} disabled={loading} style={{ opacity: loading ? 0.6 : 1 }}>
          {loading ? "Guardando…" : editingId ? "Guardar cambios" : "Guardar obra"}
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

      {/* ── List ── */}
      <hr className="cobalt-line" style={{ marginTop: "3.5rem" }} />
      <div style={{ display: "flex", alignItems: "center", gap: "2rem", margin: "2rem 0 1.5rem" }}>
        <h2 className="font-sora" style={{ fontSize: "1.3rem", fontWeight: 600 }}>
          Obras en colección ({filtered.length})
        </h2>
        <select value={filterArtist} onChange={e => setFilterArtist(e.target.value)}
          style={{ ...inp, width: "auto", marginBottom: 0, fontSize: "0.9rem" }}>
          <option value="">Todos los artistas</option>
          {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
        {filtered.map(art => (
          <div key={art.id} style={{ display: "flex", alignItems: "center", gap: "1.5rem", borderBottom: "1px solid #f0f0f0", paddingBottom: "0.8rem" }}>
            <div style={{ width: "64px", height: "64px", border: "1.5px solid #e0e0e0", overflow: "hidden", flexShrink: 0 }}>
              {(art.images?.[0] || art.image_url) &&
                <img src={art.images?.[0] ?? art.image_url} alt={art.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
            </div>
            <div style={{ flex: 1 }}>
              <p className="font-sora" style={{ fontSize: "0.95rem", fontWeight: 600 }}>{art.title}</p>
              <p className="font-sora" style={{ fontSize: "0.85rem", color: "#999" }}>{art.artists?.name} · {art.year}</p>
            </div>
            <button onClick={() => startEdit(art)} className="font-sora"
              style={{ background: "none", border: "none", color: "#0047AB", cursor: "pointer", fontSize: "0.85rem", letterSpacing: "0.06em" }}>
              Editar
            </button>
            <button onClick={() => askDelete(art)} className="font-sora"
              style={{ background: "none", border: "none", color: "#B22222", cursor: "pointer", fontSize: "0.85rem", letterSpacing: "0.06em" }}>
              Borrar
            </button>
          </div>
        ))}
      </div>

      {modal && (
        <ConfirmModal
          text={`¿Eliminar la obra "${modal.title}"? Esta acción no se puede deshacer.`}
          onConfirm={confirmDelete}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  );
}
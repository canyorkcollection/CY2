import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { supabase } from "../lib/supabaseClient";
import PageTransition from "./PageTransition";

/* ─── Zoom / Pan overlay ─── */
function ZoomOverlay({ src, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(0,71,171,0.93)",
        display: "flex", alignItems: "center", justifyContent: "center",
        touchAction: "none",
      }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: "fixed", top: "1.5rem", right: "2rem",
          background: "none", border: "none", color: "#fff",
          fontSize: "1.5rem", cursor: "pointer", zIndex: 2001, lineHeight: 1,
          fontFamily: "'Sora', sans-serif",
        }}
      >✕</button>

      {/* Stop overlay-click from closing when interacting with image */}
      <div onClick={e => e.stopPropagation()}>
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={6}
          centerOnInit
          doubleClick={{ mode: "zoomIn" }}
          wheel={{ step: 0.1 }}
          panning={{ velocityDisabled: false }}
        >
          <TransformComponent
            wrapperStyle={{ width: "100vw", height: "100vh", cursor: "grab" }}
            contentStyle={{ width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <img
              src={src}
              alt=""
              draggable={false}
              style={{
                maxWidth: "90vw", maxHeight: "90vh",
                objectFit: "contain", display: "block",
                userSelect: "none",
              }}
            />
          </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  );
}

/* ─── Main component ─── */
export default function ArtworkDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [art,       setArt]       = useState(null);
  const [related,   setRelated]   = useState([]);
  const [activeImg, setActiveImg] = useState(null);
  const [zoomSrc,   setZoomSrc]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    setArt(null);
    setRelated([]);
    setActiveImg(null);

    async function fetchData() {
      const { data, error } = await supabase
        .from("artworks")
        .select("*, artists(name)")
        .eq("id", id)
        .single();

      if (error) { setError(error.message); setLoading(false); return; }

      setArt(data);
      setActiveImg(data.images?.[0] ?? data.image_url ?? null);

      if (data.artist_id) {
        const { data: rel } = await supabase
          .from("artworks")
          .select("id, title, images, image_url")
          .eq("artist_id", data.artist_id)
          .neq("id", id);
        setRelated(rel ?? []);
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) return (
    <PageTransition>
      <p className="font-garamond" style={{ fontSize: "1.3rem", color: "#777" }}>Cargando obra…</p>
    </PageTransition>
  );

  if (error || !art) return (
    <PageTransition>
      <button className="btn-back font-sora" onClick={() => navigate("/")}>← Volver al listado</button>
      <p className="font-garamond" style={{ fontSize: "1.3rem", color: "#B22222" }}>{error ?? "Obra no encontrada."}</p>
    </PageTransition>
  );

  const images   = art.images ?? (art.image_url ? [art.image_url] : []);
  const closeUps = images.slice(1);
  const fields   = [
    ["Año",     art.year],
    ["Técnica", art.technique],
    ["Medidas", art.dimensions],
    ["Artista", art.artists?.name],
  ];

  return (
    <PageTransition>
      {zoomSrc && <ZoomOverlay src={zoomSrc} onClose={() => setZoomSrc(null)} />}

      <button className="btn-back font-sora" onClick={() => navigate("/")}>← Volver al listado</button>

      <div className="artwork-detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "4rem", alignItems: "start" }}>

        {/* Left: image */}
        <div>
          <div
            className="artwork-main-image"
            onClick={() => activeImg && setZoomSrc(activeImg)}
            style={{
              width: "100%", height: "70vh",
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden", cursor: "zoom-in",
            }}
          >
            {activeImg && (
              <img
                src={activeImg}
                alt={art.title}
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block", transition: "all 0.2s ease" }}
              />
            )}
          </div>
        </div>

        {/* Right: metadata + thumbnails */}
        <div style={{ paddingTop: "0.5rem" }}>
          <h1 className="font-garamond" style={{ fontSize: "2.2rem", fontWeight: 500, lineHeight: 1.1, marginBottom: "2rem" }}>
            {art.title}
          </h1>

          <div>
            {fields.map(([label, value], i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.9rem 0", alignItems: "baseline", gap: "1rem" }}>
                  <span className="font-sora" style={{ fontSize: "0.8rem", letterSpacing: "0.12em", color: "#0047AB", textTransform: "uppercase", flexShrink: 0 }}>
                    {label}
                  </span>
                  {label === "Artista" && art.artist_id
                    ? <Link to={`/artists/${art.artist_id}`} className="font-garamond artist-name-link" style={{ fontSize: "1.1rem", textAlign: "right" }}>{value}</Link>
                    : <span className="font-garamond" style={{ fontSize: "1.1rem", color: "#111", textAlign: "right" }}>{value}</span>
                  }
                </div>
                <hr className="cobalt-line" style={{ margin: 0 }} />
              </div>
            ))}
          </div>

          {art.description && (
            <p className="font-garamond" style={{ fontSize: "1.1rem", lineHeight: 1.85, color: "#222", marginTop: "2rem", fontStyle: "italic" }}>
              {art.description}
            </p>
          )}

          {/* Thumbnails below details */}
          {closeUps.length > 0 && (
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "2rem", flexWrap: "wrap" }}>
              <div
                className="artwork-closeup-thumb"
                onClick={() => setActiveImg(images[0])}
                style={{ width: "64px", height: "64px", overflow: "hidden", cursor: "pointer", flexShrink: 0, border: "1.5px solid #e0e0e0", borderRadius: "4px" }}
              >
                <img src={images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
              {closeUps.map((url, i) => (
                <div
                  className="artwork-closeup-thumb"
                  key={i}
                  onClick={() => setActiveImg(url)}
                  style={{ width: "64px", height: "64px", overflow: "hidden", cursor: "pointer", flexShrink: 0, border: "1.5px solid #e0e0e0", borderRadius: "4px" }}
                >
                  <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related works */}
      {related.length > 0 && (
        <div style={{ marginTop: "5rem" }}>
          <hr className="cobalt-line" />
          <h2 className="font-garamond" style={{ fontSize: "1.6rem", fontWeight: 500, margin: "2rem 0 2rem" }}>
            Otras obras del artista
          </h2>
          <div className="artwork-related-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2rem" }}>
            {related.map(rel => {
              const relImg = rel.images?.[0] ?? rel.image_url;
              return (
                <Link key={rel.id} to={`/artwork/${rel.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div
                    style={{ transition: "opacity 0.2s ease" }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  >
                    <div style={{ width: "100%", height: "200px", background: "#f5f5f5", overflow: "hidden", border: "1.5px solid #e0e0e0" }}>
                      {relImg && <img src={relImg} alt={rel.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
                    </div>
                    <p className="font-garamond" style={{ fontSize: "1.05rem", marginTop: "0.7rem", color: "#111" }}>{rel.title}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </PageTransition>
  );
}
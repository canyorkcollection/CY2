import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import PageTransition from "./PageTransition";

export default function Gallery() {
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    async function fetchArtworks() {
      const { data, error } = await supabase
        .from("artworks")
        .select("*, artists(name)");
      if (error) setError(error.message);
      else setArtworks(data);
      setLoading(false);
    }
    fetchArtworks();
  }, []);

  if (loading) return <PageTransition><p className="font-garamond" style={{ fontSize: "1.3rem", color: "#777" }}>Cargando colección…</p></PageTransition>;
  if (error)   return <PageTransition><p className="font-garamond" style={{ fontSize: "1.3rem", color: "#B22222" }}>Error: {error}</p></PageTransition>;

  return (
    <PageTransition>
      <div style={{ marginBottom: "3.5rem" }}>
        <h1 className="font-sora" style={{ fontSize: "2.4rem", fontWeight: 700, lineHeight: 1.15, marginBottom: "1.2rem" }}>
          Obras en colección
        </h1>
        <p className="font-garamond" style={{ fontSize: "1.3rem", color: "#333", maxWidth: "520px", lineHeight: 1.7 }}>
          Una selección privada de arte contemporáneo reunida durante dos décadas en los márgenes de lo visible.
        </p>
      </div>

      <div className="slider-track">
        {artworks.map(art => {
          const imgSrc = art.images?.[0] ?? art.image_url;
          return (
            <div key={art.id} className="art-card" onClick={() => navigate(`/artwork/${art.id}`)}>
              {/* Fixed-height container, image shown at natural proportions */}
              <div style={{
                width: "100%",
                height: "80vh",
                background: "#f5f5f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                border: "2px solid transparent",
                transition: "border-color 0.3s, transform 0.3s",
              }}
                className="card-img-wrap"
              >
                {imgSrc && (
                  <img
                    src={imgSrc}
                    alt={art.title}
                    style={{ maxHeight: "100%", maxWidth: "100%", width: "auto", height: "100%", objectFit: "contain", display: "block" }}
                  />
                )}
              </div>
              <div style={{ paddingTop: "1.2rem" }}>
                <h2 className="font-sora" style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.3rem" }}>{art.title}</h2>
                <p className="font-garamond" style={{ fontSize: "1.1rem", color: "#444" }}>
                  {art.artists?.name} &nbsp;·&nbsp; {art.year}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <hr className="cobalt-line" style={{ marginTop: "3.5rem" }} />
      <p className="font-garamond" style={{ fontSize: "1.1rem", color: "#777", marginTop: "1.2rem" }}>
        Haz clic sobre cualquier obra para ver su ficha completa.
      </p>
    </PageTransition>
  );
}
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import PageTransition from "./PageTransition";

// Parses "38 1/2 x 57 1/2 in", "121.9 x 121.9", "36 x 30 x 2 in", etc.
// Returns { w, h } in cm, or null if invalid.
function parseDimensions(dim) {
  if (!dim || !dim.trim()) return null;
  // Resolve mixed fractions: "38 1/2" → "38.5"
  const str = dim.replace(/(\d+)\s+(\d+)\/(\d+)/g, (_, whole, num, den) =>
    String(parseFloat(whole) + parseFloat(num) / parseFloat(den))
  );
  const nums = str.match(/[\d.]+/g)?.map(Number);
  if (!nums || nums.length < 2 || nums[0] === 0 || nums[1] === 0) return null;
  const inch = /in/i.test(dim);
  return {
    w: inch ? nums[0] * 2.54 : nums[0],
    h: inch ? nums[1] * 2.54 : nums[1],
  };
}

const MAX_H = 520; // px — tallest artwork
const MIN_H = 160; // px — smallest artwork
const FALLBACK_H = 320; // px — works with no dimension data

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

  if (loading) {
    return (
      <PageTransition>
        <p className="font-garamond" style={{ fontSize: "1.3rem", color: "#777" }}>Cargando colección…</p>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <p className="font-garamond" style={{ fontSize: "1.3rem", color: "#B22222" }}>Error al cargar: {error}</p>
      </PageTransition>
    );
  }

  // Find tallest real height (cm) to scale against
  const dims = artworks.map(a => parseDimensions(a.dimensions));
  const realHeights = dims.map(d => d?.h).filter(Boolean);
  const maxRealH = realHeights.length ? Math.max(...realHeights) : 200;

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
        {artworks.map((art, i) => {
          const imgSrc = art.images?.[0] ?? art.image_url;
          const dim    = dims[i];
          const artH   = dim
            ? Math.round(Math.max(MIN_H, (dim.h / maxRealH) * MAX_H))
            : FALLBACK_H;
          const artW   = dim
            ? Math.round(artH * (dim.w / dim.h))
            : Math.round(FALLBACK_H * 0.85);

          return (
            <div
              key={art.id}
              className="art-card"
              onClick={() => navigate(`/artwork/${art.id}`)}
              style={{ width: `${artW}px` }}
            >
              <div
                className="card-img-wrap"
                style={{ height: `${artH}px` }}
              >
                {imgSrc && (
                  <img
                    src={imgSrc}
                    alt={art.title}
                    style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                  />
                )}
              </div>
              <div style={{ paddingTop: "1rem" }}>
                <h2 className="font-sora" style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.2rem" }}>
                  {art.title}
                </h2>
                <p className="font-garamond" style={{ fontSize: "1rem", color: "#444" }}>
                  {art.artists?.name}{art.year ? ` · ${art.year}` : ""}
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

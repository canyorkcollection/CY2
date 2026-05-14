import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import PageTransition from "./PageTransition";

// Returns aspect ratio w/h from dimension string, or null if invalid.
function aspectRatio(dim) {
  if (!dim || !dim.trim()) return null;
  const str = dim.replace(/(\d+)\s+(\d+)\/(\d+)/g, (_, whole, num, den) =>
    String(parseFloat(whole) + parseFloat(num) / parseFloat(den))
  );
  const nums = str.match(/[\d.]+/g)?.map(Number);
  if (!nums || nums.length < 2 || nums[0] === 0 || nums[1] === 0) return null;
  return nums[0] / nums[1];
}

const CARD_H = 500; // px — same for all artworks
const MIN_W  = 180;
const MAX_W  = 380;

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
        <p className="font-garamond" style={{ fontSize: "1.3rem", color: "#777" }}>Loading collection…</p>
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

  return (
    <PageTransition>
      <div style={{ marginBottom: "3.5rem" }}>
        <h1 className="font-sora" style={{ fontSize: "2.4rem", fontWeight: 700, lineHeight: 1.15, marginBottom: "1.2rem" }}>
          Works in the collection
        </h1>
        <p className="font-garamond" style={{ fontSize: "1.3rem", color: "#333", maxWidth: "520px", lineHeight: 1.7 }}>
          A private selection of contemporary art assembled over two decades at the margins of the visible.
        </p>
      </div>

      <div className="slider-track">
        {artworks.map(art => {
          const imgSrc = art.images?.[0] ?? art.image_url;
          const ratio  = aspectRatio(art.dimensions);
          const artW   = ratio
            ? Math.round(Math.min(MAX_W, Math.max(MIN_W, CARD_H * ratio)))
            : Math.round(CARD_H * 0.85);

          return (
            <div
              key={art.id}
              className="art-card"
              onClick={() => navigate(`/artwork/${art.id}`)}
              style={{ width: `${artW}px` }}
            >
              <div
                className="card-img-wrap"
                style={{ height: `${CARD_H}px` }}
              >
                {imgSrc && (
                  <img
                    src={imgSrc}
                    alt={art.title}
                    style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                  />
                )}
              </div>
              <div style={{ paddingTop: "1rem", textAlign: "center" }}>
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
        Click on any work to view its full details.
      </p>
    </PageTransition>
  );
}

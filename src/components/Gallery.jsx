import React, { useState, useEffect, useRef } from "react";
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

function GalleryEnd({ height }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      flexShrink: 0, width: "260px", height: `${height}px`,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "flex-end",
      paddingBottom: "4rem",
    }}>
      <div style={{
        width: "44px", height: "44px", borderRadius: "50%",
        background: "#0047AB",
        transform: visible ? "translateY(0)" : "translateY(50px)",
        opacity: visible ? 1 : 0,
        transition: "transform 1.1s cubic-bezier(0.16,1,0.3,1), opacity 1.1s ease",
      }} />
      <p className="font-sora" style={{
        fontSize: "0.78rem", color: "#0047AB",
        letterSpacing: "0.16em", textTransform: "uppercase",
        marginTop: "1.6rem", textAlign: "center",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.9s ease 0.7s",
      }}>
        Thank you for visiting.
      </p>
    </div>
  );
}

const CARD_H = 500; // px — same for all artworks
const MIN_W  = 180;
const MAX_W  = 380;

const DEFAULT_INTRO = {
  headline:    "Works in the collection",
  description: "A private selection of contemporary art assembled over two decades at the margins of the visible.",
};

export default function Gallery() {
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState([]);
  const [intro,    setIntro]    = useState(DEFAULT_INTRO);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    async function fetchAll() {
      const [{ data: artData, error: artErr }, { data: introRow }] = await Promise.all([
        supabase.from("artworks").select("*, artists(name)"),
        supabase.from("site_content").select("data").eq("key", "gallery").single(),
      ]);
      if (artErr) setError(artErr.message);
      else setArtworks(artData);
      if (introRow?.data) setIntro({ ...DEFAULT_INTRO, ...introRow.data });
      setLoading(false);
    }
    fetchAll();
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
          {intro.headline}
        </h1>
        <p className="font-garamond" style={{ fontSize: "1.3rem", color: "#333", maxWidth: "520px", lineHeight: 1.7 }}>
          {intro.description}
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
        <GalleryEnd height={CARD_H} />
      </div>

      <hr className="cobalt-line" style={{ marginTop: "3.5rem" }} />
      <p className="font-garamond" style={{ fontSize: "1.1rem", color: "#777", marginTop: "1.2rem" }}>
        Click on any work to view its full details.
      </p>
    </PageTransition>
  );
}

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import PageTransition from "./PageTransition";

export default function ArtistDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [artist,   setArtist]   = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    async function fetchData() {
      const [{ data: artistData, error: artistErr }, { data: worksData, error: worksErr }] =
        await Promise.all([
          supabase.from("artists").select("*").eq("id", id).single(),
          supabase.from("artworks").select("id, title, year, images, image_url").eq("artist_id", id),
        ]);

      if (artistErr) setError(artistErr.message);
      else if (worksErr) setError(worksErr.message);
      else { setArtist(artistData); setArtworks(worksData ?? []); }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) return <PageTransition><p className="font-garamond" style={{ fontSize: "1.3rem", color: "#777" }}>Cargando artista…</p></PageTransition>;
  if (error || !artist) return (
    <PageTransition>
      <button className="btn-back font-sora" onClick={() => navigate("/artists")}>← Volver a artistas</button>
      <p className="font-garamond" style={{ fontSize: "1.3rem", color: "#B22222" }}>{error ?? "Artista no encontrado."}</p>
    </PageTransition>
  );

  return (
    <PageTransition>
      <button className="btn-back font-sora" onClick={() => navigate("/artists")}>← Volver a artistas</button>

      {/* Artist header */}
      <div className="artist-detail-header" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "4rem", alignItems: "start", marginBottom: "5rem" }}>
        <div className="artist-detail-photo" style={{ border: "2px solid #0047AB", overflow: "hidden", height: "340px" }}>
          {artist.photo_url
            ? <img src={artist.photo_url} alt={artist.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            : <div style={{ width: "100%", height: "100%", background: "#e8e8e8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="font-sora" style={{ color: "#aaa", fontSize: "0.85rem", letterSpacing: "0.1em" }}>SIN FOTO</span>
              </div>
          }
        </div>

        <div style={{ paddingTop: "0.5rem" }}>
          <h1 className="font-sora" style={{ fontSize: "2.6rem", fontWeight: 700, lineHeight: 1.1, marginBottom: "1.5rem" }}>
            {artist.name}
          </h1>
          <hr className="cobalt-line" />
          <p className="font-garamond" style={{ fontSize: "1.2rem", lineHeight: 1.85, color: "#222", marginTop: "1.5rem" }}>
            {artist.bio}
          </p>
        </div>
      </div>

      {/* Artworks section */}
      <hr className="cobalt-line" />
      <h2 className="font-garamond" style={{ fontSize: "1.6rem", fontWeight: 500, margin: "2rem 0 2rem" }}>
        Obras disponibles
      </h2>

      {artworks.length === 0 ? (
        <p className="font-sora" style={{ fontSize: "1rem", color: "#999" }}>Sin obras disponibles en este momento.</p>
      ) : (
        <div className="artist-works-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2.5rem" }}>
          {artworks.map(art => {
            const imgSrc = art.images?.[0] ?? art.image_url;
            return (
              <Link key={art.id} to={`/artwork/${art.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div
                  style={{ transition: "opacity 0.2s ease" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  <div style={{ width: "100%", height: "280px", background: "#f5f5f5", overflow: "hidden", border: "1.5px solid #e0e0e0" }}>
                    {imgSrc && <img src={imgSrc} alt={art.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
                  </div>
                  <p className="font-garamond" style={{ fontSize: "1.15rem", marginTop: "0.8rem", color: "#111", lineHeight: 1.3 }}>{art.title}</p>
                  <p className="font-sora" style={{ fontSize: "0.82rem", color: "#999", marginTop: "0.25rem", letterSpacing: "0.06em" }}>{art.year}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </PageTransition>
  );
}
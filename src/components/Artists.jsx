import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import PageTransition from "./PageTransition";

export default function Artists() {
  const navigate = useNavigate();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    async function fetchArtists() {
      const { data, error } = await supabase.from("artists").select("*");
      if (error) setError(error.message);
      else setArtists(data);
      setLoading(false);
    }
    fetchArtists();
  }, []);

  if (loading) return (
    <PageTransition>
      <p className="font-garamond" style={{ fontSize: "1.3rem", color: "#777" }}>Cargando artistas…</p>
    </PageTransition>
  );

  if (error) return (
    <PageTransition>
      <p className="font-garamond" style={{ fontSize: "1.3rem", color: "#B22222" }}>Error al cargar: {error}</p>
    </PageTransition>
  );

  return (
    <PageTransition>
      <div style={{ marginBottom: "3.5rem" }}>
        <h1 className="font-sora" style={{ fontSize: "2.4rem", fontWeight: 700, lineHeight: 1.15, marginBottom: "1.2rem" }}>
          Artistas
        </h1>
        <p className="font-garamond" style={{ fontSize: "1.3rem", color: "#333", maxWidth: "520px", lineHeight: 1.7 }}>
          Las voces que dan forma a la colección.
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "3rem",
      }}>
        {artists.map(artist => (
          <div
            key={artist.id}
            onClick={() => navigate(`/artists/${artist.id}`)}
            style={{ cursor: "pointer" }}
            className="artist-card"
          >
            {/* Foto */}
            <div style={{
              width: "100%",
              height: "320px",
              overflow: "hidden",
              border: "2px solid transparent",
              transition: "border-color 0.3s, transform 0.3s",
              marginBottom: "1.2rem",
            }}
              className="artist-card-img"
            >
              {artist.photo_url ? (
                <img
                  src={artist.photo_url}
                  alt={artist.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "#e8e8e8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="font-sora" style={{ color: "#aaa", fontSize: "0.85rem", letterSpacing: "0.1em" }}>SIN FOTO</span>
                </div>
              )}
            </div>

            {/* Info */}
            <h2 className="font-sora" style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              {artist.name}
            </h2>
            <p className="font-garamond" style={{ fontSize: "1.1rem", color: "#555", lineHeight: 1.6 }}>
              {artist.bio?.slice(0, 120)}{artist.bio?.length > 120 ? "…" : ""}
            </p>
          </div>
        ))}
      </div>
    </PageTransition>
  );
}
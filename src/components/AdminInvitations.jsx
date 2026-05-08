import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function AdminInvitations() {
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  
  const [invites, setInvites] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const headers = {
    "Content-Type": "application/json",
    "apikey": supabaseKey, 
    "Authorization": `Bearer ${session.access_token}`,
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  async function fetchInvites() {
    setLoadingList(true);
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/manage-users`, { headers });
      const data = await res.json();
      if (res.ok) setInvites(data);
    } catch (err) {
      console.error("Error listando invites:", err);
    } finally {
      setLoadingList(false);
    }
  }

  async function handleInvite() {
    if (!email) return;
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/send-invite`, {
        method: "POST",
        headers,
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setFeedback({ type: "ok", text: `Invitación enviada a ${email}` });
        setEmail("");
        fetchInvites(); 
      } else {
        setFeedback({ type: "err", text: data.error || "Error al enviar" });
      }
    } catch (err) {
      setFeedback({ type: "err", text: `Error de conexión: ${err.message}` });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(userId, userEmail) {
    if (!window.confirm(`¿Revocar acceso a ${userEmail}?`)) return;

    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/manage-users`, {
        method: "DELETE",
        headers,
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        setFeedback({ type: "ok", text: `Acceso revocado a ${userEmail}` });
        fetchInvites(); 
      } else {
        const data = await res.json();
        setFeedback({ type: "err", text: data.error || "Error al borrar" });
      }
    } catch (err) {
      setFeedback({ type: "err", text: "Error de conexión al borrar" });
    }
  }

  return (
    <div>
      <h2 className="font-sora" style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>
        Invitar acceso
      </h2>

      <p className="font-sora" style={{ fontSize: "0.8rem", color: "#999", marginBottom: "2rem", lineHeight: 1.6, maxWidth: "480px" }}>
        El invitado recibirá un email con un Magic Link. El registro público está deshabilitado, por lo que esta es la única vía de entrada.
      </p>

      <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end", maxWidth: "480px" }}>
        <div style={{ flex: 1 }}>
          <label className="font-sora" style={{ fontSize: "0.75rem", letterSpacing: "0.12em", color: "#0047AB", textTransform: "uppercase", display: "block", marginBottom: "0.25rem" }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleInvite()}
            placeholder="invitado@email.com"
            className="font-sora"
            style={{ width: "100%", border: "none", borderBottom: "1.5px solid #0047AB", outline: "none", fontSize: "1.05rem", padding: "0.5rem 0", background: "transparent", color: "#111", fontFamily: "'Sora', sans-serif" }}
          />
        </div>
        <button className="btn-cobalt font-sora" onClick={handleInvite} disabled={loading} style={{ opacity: loading ? 0.6 : 1, whiteSpace: "nowrap", flexShrink: 0 }}>
          {loading ? "Enviando…" : "Invitar"}
        </button>
      </div>

      {feedback && (
        <p className="font-sora" style={{ marginTop: "1rem", fontSize: "0.9rem", color: feedback.type === "ok" ? "#16a34a" : "#dc2626" }}>
          {feedback.text}
        </p>
      )}

      <hr className="cobalt-line" style={{ marginTop: "3rem", marginBottom: "2rem" }} />
      
      <h3 className="font-sora" style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1.5rem" }}>
        Usuarios invitados
      </h3>

      {loadingList ? (
        <p className="font-sora" style={{ fontSize: "0.85rem", color: "#999" }}>Cargando...</p>
      ) : invites.length === 0 ? (
        <p className="font-sora" style={{ fontSize: "0.85rem", color: "#999" }}>No hay invitaciones registradas.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", maxWidth: "600px" }}>
          {invites.map(inv => (
            <div key={inv.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0", paddingBottom: "0.8rem" }}>
              <div>
                <p className="font-sora" style={{ fontSize: "0.95rem", fontWeight: 500, margin: 0 }}>{inv.email}</p>
                <p className="font-sora" style={{ fontSize: "0.75rem", color: "#999", margin: "4px 0 0 0" }}>
                  {inv.last_sign_in_at 
                    ? `Activo · Último acceso: ${new Date(inv.last_sign_in_at).toLocaleDateString()}`
                    : `Pendiente · Invitado: ${new Date(inv.invited_at).toLocaleDateString()}`
                  }
                </p>
              </div>
              <button 
                onClick={() => handleDelete(inv.id, inv.email)}
                className="font-sora"
                style={{ background: "none", border: "none", color: "#B22222", cursor: "pointer", fontSize: "0.85rem", letterSpacing: "0.06em" }}
              >
                Revocar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

export default function AdminInvitations() {
  const { session } = useAuth();
  const [email,        setEmail]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [feedback,     setFeedback]     = useState(null);
  const [invites,      setInvites]      = useState([]);
  const [requests,     setRequests]     = useState([]);
  const [loadingList,  setLoadingList]  = useState(true);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const headers = {
    "Content-Type": "application/json",
    "apikey": supabaseKey,
    "Authorization": `Bearer ${session.access_token}`,
  };

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoadingList(true);
    await Promise.all([fetchInvites(), fetchRequests()]);
    setLoadingList(false);
  }

  async function fetchInvites() {
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/manage-users`, { headers });
      const data = await res.json();
      if (res.ok) setInvites(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchRequests() {
    const { data } = await supabase
      .from("access_requests")
      .select("*")
      .eq("status", "pending")
      .order("requested_at", { ascending: false });
    if (data) setRequests(data);
  }

  async function sendInvite(emailToInvite) {
    const res = await fetch(`${supabaseUrl}/functions/v1/send-invite`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email: emailToInvite }),
    });
    return res;
  }

  async function handleInvite() {
    if (!email) return;
    setLoading(true);
    setFeedback(null);
    const res = await sendInvite(email);
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      flash("ok", `Invite sent to ${email}`);
      setEmail("");
      fetchInvites();
    } else {
      flash("err", data.error || "Error sending invite");
    }
    setLoading(false);
  }

  async function handleApprove(request) {
    setFeedback(null);
    const res = await sendInvite(request.email);
    if (res.ok) {
      await supabase.from("access_requests").update({ status: "approved" }).eq("id", request.id);
      flash("ok", `Invite sent to ${request.email}`);
      fetchAll();
    } else {
      const data = await res.json().catch(() => ({}));
      flash("err", data.error || "Error sending invite");
    }
  }

  async function handleDelete(userId, userEmail) {
    if (!window.confirm(`Revoke access for ${userEmail}?`)) return;
    const res = await fetch(`${supabaseUrl}/functions/v1/manage-users`, {
      method: "DELETE",
      headers,
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      flash("ok", `Access revoked for ${userEmail}`);
      fetchInvites();
    } else {
      const data = await res.json().catch(() => ({}));
      flash("err", data.error || "Error revoking access");
    }
  }

  async function handleDismiss(id) {
    await supabase.from("access_requests").update({ status: "dismissed" }).eq("id", id);
    fetchRequests();
  }

  function flash(type, text) {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  }

  const row = { display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0", paddingBottom: "0.8rem" };
  const meta = { fontSize: "0.75rem", color: "#999", margin: "4px 0 0 0" };

  return (
    <div>

      {/* Access requests */}
      {(requests.length > 0 || loadingList) && (
        <>
          <h2 className="font-sora" style={{ fontSize: "1.4rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            Access requests
          </h2>
          <p className="font-sora" style={{ fontSize: "0.8rem", color: "#999", marginBottom: "2rem" }}>
            People who entered their email but are not yet invited.
          </p>

          {loadingList ? (
            <p className="font-sora" style={{ fontSize: "0.85rem", color: "#999" }}>Loading…</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", maxWidth: "600px", marginBottom: "3rem" }}>
              {requests.map(req => (
                <div key={req.id} style={row}>
                  <div>
                    <p className="font-sora" style={{ fontSize: "0.95rem", fontWeight: 500, margin: 0 }}>{req.email}</p>
                    <p className="font-sora" style={meta}>
                      Requested {new Date(req.requested_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button
                      onClick={() => handleApprove(req)}
                      className="btn-cobalt font-sora"
                      style={{ fontSize: "0.8rem", padding: "0.35rem 1rem" }}
                    >
                      Invite
                    </button>
                    <button
                      onClick={() => handleDismiss(req.id)}
                      className="font-sora"
                      style={{ background: "none", border: "none", color: "#bbb", cursor: "pointer", fontSize: "0.85rem" }}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <hr className="cobalt-line" style={{ marginBottom: "3rem" }} />
        </>
      )}

      {/* Invite manually */}
      <h2 className="font-sora" style={{ fontSize: "1.4rem", fontWeight: 600, marginBottom: "0.5rem" }}>
        Invite
      </h2>
      <p className="font-sora" style={{ fontSize: "0.8rem", color: "#999", marginBottom: "2rem", lineHeight: 1.6, maxWidth: "480px" }}>
        Send a magic link directly. Sign-ups are disabled — this is the only way in.
      </p>

      <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end", maxWidth: "480px", marginBottom: "3rem" }}>
        <div style={{ flex: 1 }}>
          <label className="font-sora" style={{ fontSize: "0.75rem", letterSpacing: "0.12em", color: "#0047AB", textTransform: "uppercase", display: "block", marginBottom: "0.25rem" }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleInvite()}
            placeholder="guest@email.com"
            className="font-sora"
            style={{ width: "100%", border: "none", borderBottom: "1.5px solid #0047AB", outline: "none", fontSize: "1.05rem", padding: "0.5rem 0", background: "transparent", color: "#111" }}
          />
        </div>
        <button className="btn-cobalt font-sora" onClick={handleInvite} disabled={loading} style={{ opacity: loading ? 0.6 : 1, whiteSpace: "nowrap", flexShrink: 0 }}>
          {loading ? "Sending…" : "Send invite"}
        </button>
      </div>

      {feedback && (
        <p className="font-sora" style={{ marginBottom: "2rem", fontSize: "0.9rem", color: feedback.type === "ok" ? "#16a34a" : "#dc2626" }}>
          {feedback.text}
        </p>
      )}

      <hr className="cobalt-line" style={{ marginBottom: "3rem" }} />

      {/* Invited users list */}
      <h3 className="font-sora" style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1.5rem" }}>
        Invited users
      </h3>

      {loadingList ? (
        <p className="font-sora" style={{ fontSize: "0.85rem", color: "#999" }}>Loading…</p>
      ) : invites.length === 0 ? (
        <p className="font-sora" style={{ fontSize: "0.85rem", color: "#999" }}>No pending invitations.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", maxWidth: "600px" }}>
          {invites.map(inv => (
            <div key={inv.id} style={row}>
              <div>
                <p className="font-sora" style={{ fontSize: "0.95rem", fontWeight: 500, margin: 0 }}>{inv.email}</p>
                <p className="font-sora" style={meta}>
                  {inv.last_sign_in_at
                    ? `Active · Last sign in: ${new Date(inv.last_sign_in_at).toLocaleDateString()}`
                    : `Pending · Invited: ${new Date(inv.invited_at).toLocaleDateString()}`}
                </p>
              </div>
              <button
                onClick={() => handleDelete(inv.id, inv.email)}
                className="font-sora"
                style={{ background: "none", border: "none", color: "#B22222", cursor: "pointer", fontSize: "0.85rem", letterSpacing: "0.06em" }}
              >
                Revoke
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Parse hash tokens and establish session manually
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/", { replace: true });
        return;
      }

      // If no session yet, wait for onAuthStateChange to pick up the hash
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" && session) {
          navigate("/", { replace: true });
        }
        if (event === "PASSWORD_RECOVERY") {
          navigate("/admin/login?recovery=true", { replace: true });
        }
      });

      return () => subscription.unsubscribe();
    });
  }, [navigate]);

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "#fff",
    }}>
      <span className="font-sora" style={{ fontSize: "0.85rem", color: "#999", letterSpacing: "0.12em" }}>
        Accediendo…
      </span>
    </div>
  );
}
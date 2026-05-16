import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { email } = await req.json();
    if (!email) return json({ error: "email_required" }, 400);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Check email exists in auth.users (invited or confirmed)
    const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    if (listErr) throw listErr;

    const user = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) return json({ error: "not_invited" }, 422);

    // Generate a one-time token the client will use to establish the session immediately
    const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: "https://www.canyork.com/auth/callback" },
    });
    if (linkErr) throw linkErr;

    return json({ token_hash: linkData.properties.hashed_token });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
});

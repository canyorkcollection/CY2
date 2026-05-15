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

    // Verify email is in auth.users (invited or confirmed)
    const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    if (listErr) throw listErr;

    const user = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) return json({ error: "not_invited" }, 422);

    // Generate a magic link using admin API — works for pending and confirmed users
    const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: "https://www.canyork.com/auth/callback" },
    });
    if (linkErr) throw linkErr;

    const actionLink = linkData.properties.action_link;

    // Send via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Can York <noreply@canyork.com>",
        to: email,
        subject: "Your sign-in link to Can York",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; color: #111;">
            <p style="font-size: 22px; font-weight: 700; letter-spacing: 0.1em; color: #0047AB; margin-bottom: 32px;">CAN YORK</p>
            <p style="font-size: 16px; line-height: 1.7; margin-bottom: 32px;">
              Click the link below to sign in to the Can York collection.
            </p>
            <a href="${actionLink}"
               style="display: inline-block; background: #0047AB; color: #fff;
                      padding: 14px 28px; text-decoration: none;
                      font-size: 14px; letter-spacing: 0.08em;">
              Sign in to Can York
            </a>
            <p style="margin-top: 40px; font-size: 12px; color: #aaa; line-height: 1.7;">
              This link expires in 24 hours.<br>
              If you did not request this, you can safely ignore this email.
            </p>
          </div>
        `,
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.json();
      throw new Error(err.message ?? "Error sending email");
    }

    return json({ success: true });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
});

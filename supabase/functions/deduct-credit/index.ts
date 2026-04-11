import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Not authenticated");

    const { type } = await req.json();

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if premium
    const { data: profile } = await adminClient
      .from("profiles")
      .select("subscription, ai_credits_remaining, disease_credits_remaining")
      .eq("user_id", user.id)
      .single();

    if (!profile) throw new Error("Profile not found");

    const isPremium = profile.subscription === "premium" || profile.subscription === "pro";
    if (isPremium) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "ai") {
      if (profile.ai_credits_remaining <= 0) {
        return new Response(JSON.stringify({ error: "No AI credits remaining" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      await adminClient.from("profiles").update({
        ai_credits_remaining: profile.ai_credits_remaining - 1,
      }).eq("user_id", user.id);
    } else if (type === "disease") {
      if (profile.disease_credits_remaining <= 0) {
        return new Response(JSON.stringify({ error: "No disease scan credits remaining" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      await adminClient.from("profiles").update({
        disease_credits_remaining: profile.disease_credits_remaining - 1,
      }).eq("user_id", user.id);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

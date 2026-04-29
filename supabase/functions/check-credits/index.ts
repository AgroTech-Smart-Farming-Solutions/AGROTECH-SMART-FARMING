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

    const { type } = await req.json(); // "ai" or "disease"

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription, ai_credits_remaining, disease_credits_remaining, disease_credits_date")
      .eq("user_id", user.id)
      .single();

    if (!profile) throw new Error("Profile not found");

    const isPremium = profile.subscription === "premium" || profile.subscription === "pro";

    if (isPremium) {
      return new Response(JSON.stringify({ allowed: true, remaining: -1, isPremium: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "ai") {
      return new Response(JSON.stringify({
        allowed: profile.ai_credits_remaining > 0,
        remaining: profile.ai_credits_remaining,
        isPremium: false,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (type === "disease") {
      const today = new Date().toISOString().split("T")[0];
      let remaining = profile.disease_credits_remaining;

      // Reset daily credit if it's a new day
      if (profile.disease_credits_date !== today) {
        remaining = 1;
        const adminClient = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );
        await adminClient.from("profiles").update({
          disease_credits_remaining: 1,
          disease_credits_date: today,
        }).eq("user_id", user.id);
      }

      return new Response(JSON.stringify({
        allowed: remaining > 0,
        remaining,
        isPremium: false,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    throw new Error("Invalid type");
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

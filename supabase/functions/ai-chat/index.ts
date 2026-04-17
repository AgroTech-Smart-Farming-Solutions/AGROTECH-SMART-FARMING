import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, language } = await req.json();
    
    // UPDATED: Now using the specific Chat key from your secrets
    // Note: In Supabase secrets, it's usually just "GEMINI_API_KEY_CHAT" 
    // without the VITE_ prefix (VITE is for frontend).
    const GEMINI_API_KEY = Deno.env.get("VITE_GEMINI_API_KEY_AICHAT");
    
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY_AICHAT is missing in Supabase secrets");
      throw new Error("AI configuration missing");
    }

    const langMap: Record<string, string> = {
      en: "English", hi: "Hindi", mr: "Marathi", pa: "Punjabi",
      ta: "Tamil", te: "Telugu", bn: "Bengali", gu: "Gujarati",
    };
    const langName = langMap[language] || "English";

    const systemPrompt = `You are "Kisan Sahayak" (किसान सहायक), an expert AI farming assistant for Indian farmers. 
    IMPORTANT RULES:
    1. Always respond in ${langName} language
    2. Give practical, actionable advice
    3. Keep responses concise but informative (2-4 paragraphs max)
    4. Use markdown formatting for better readability`;

    const allMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // UPDATED: Switching to Gemini 1.5 Flash for better free-tier stability
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: allMessages.map(m => ({
          role: m.role === "system" ? "user" : m.role, // Gemini uses 'user'/'model' roles
          parts: [{ text: m.content }]
        })),
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI service busy. Try again in 1 minute." }), {
        status: response.status, 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I could not generate a response.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64, language, cropContext } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not found in Secrets");

    // AAPKI LIST SE SABSE BEST MODEL JO VISION SUPPORT KARTA HAI
    const modelId = "gemini-2.0-flash-lite"; 
    
    // Final URL Format for Gemini API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${GEMINI_API_KEY}`;
    
    console.log(`Analyzing ${cropContext} using: ${modelId}`);

    const langMap: Record<string, string> = {
      en: "English", hi: "Hindi", mr: "Marathi", pa: "Punjabi",
      ta: "Tamil", te: "Telugu", bn: "Bengali", gu: "Gujarati",
    };
    const langName = langMap[language] || "English";

    const prompt = `You are a plant pathologist. Analyze this ${cropContext} leaf. Return ONLY a JSON: {"disease":"","confidence":0,"description":"","severity":"","treatment":[],"fertilizer":"","prevention":""} in ${langName}.`;

    let cleanBase64 = imageBase64;
    if (imageBase64.includes(",")) {
      cleanBase64 = imageBase64.split(",")[1];
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: "image/jpeg", data: cleanBase64 } }
          ]
        }],
        generationConfig: {
          response_mime_type: "application/json",
        },
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error("Gemini API Error:", JSON.stringify(result));
      throw new Error(result.error?.message || "Analysis failed");
    }

    const rawContent = result.candidates[0].content.parts[0].text;
    const diagnosis = JSON.parse(rawContent);

    return new Response(JSON.stringify({ diagnosis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Critical Error:", e.message);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

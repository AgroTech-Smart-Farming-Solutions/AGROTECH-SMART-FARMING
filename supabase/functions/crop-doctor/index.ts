import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64, language, cropContext } = await req.json();
    
    // Fetching the NEW secret name we set up
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY_CROP");

    if (!GEMINI_API_KEY) {
      console.error("Configuration Error: GEMINI_API_KEY_CROP not found");
      throw new Error("Server configuration error");
    }

    const modelId = "gemini-2.5-flash"; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${GEMINI_API_KEY}`;
    
    const langMap: Record<string, string> = {
      en: "English", hi: "Hindi", mr: "Marathi", pa: "Punjabi",
      ta: "Tamil", te: "Telugu", bn: "Bengali", gu: "Gujarati",
    };
    const langName = langMap[language] || "English";

    // Enhanced prompt for better JSON reliability
    const prompt = `You are an expert plant pathologist. Analyze this ${cropContext} leaf image. 
    Provide a detailed diagnosis in ${langName} language.
    Return ONLY a valid JSON object with this structure:
    {"disease": "name of disease", "confidence": percentage, "description": "detailed explanation", "severity": "Low/Medium/High", "treatment": ["step 1", "step 2"], "fertilizer": "recommended fertilizer", "prevention": "how to prevent in future"}`;

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
          temperature: 0.4, // Lower temperature makes JSON more consistent
        },
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error("Gemini API Error Detail:", JSON.stringify(result));
      // Specifically handle the 429 error for the user
      if (response.status === 429) {
        throw new Error("The AI is a bit busy right now. Please wait 60 seconds and try again.");
      }
      throw new Error(result.error?.message || "Analysis failed");
    }

    // Safety check for empty results
    if (!result.candidates || !result.candidates[0]) {
      throw new Error("AI could not analyze this image. Please try a clearer photo.");
    }

    const rawContent = result.candidates[0].content.parts[0].text;
    const diagnosis = JSON.parse(rawContent);

    return new Response(JSON.stringify({ diagnosis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Critical Error in crop-doctor:", e.message);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
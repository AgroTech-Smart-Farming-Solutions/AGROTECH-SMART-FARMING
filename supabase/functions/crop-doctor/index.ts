import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
<<<<<<< HEAD
    const { imageBase64, language, cropContext } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not found in Secrets");

    // AAPKI LIST SE SABSE BEST MODEL JO VISION SUPPORT KARTA HAI
    const modelId = "gemini-2.0-flash-lite"; 
    
    // Final URL Format for Gemini API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${GEMINI_API_KEY}`;
    
    console.log(`Analyzing ${cropContext} using: ${modelId}`);
=======
    const { imageBase64, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
>>>>>>> 7d96f724218d846c0d47fe2311c66db07aa275df

    const langMap: Record<string, string> = {
      en: "English", hi: "Hindi", mr: "Marathi", pa: "Punjabi",
      ta: "Tamil", te: "Telugu", bn: "Bengali", gu: "Gujarati",
    };
    const langName = langMap[language] || "English";

<<<<<<< HEAD
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
=======
    const prompt = `You are an expert agricultural plant pathologist. Analyze this image of a plant/crop leaf and provide a diagnosis.

RESPOND IN ${langName} LANGUAGE.

Return your response in the following JSON format ONLY (no markdown, no code blocks, just raw JSON):
{
  "disease": "Name of the disease or 'Healthy' if no disease",
  "confidence": 85,
  "description": "Brief description of the disease and its cause",
  "severity": "low" or "medium" or "high",
  "treatment": [
    "Step 1 treatment",
    "Step 2 treatment",
    "Step 3 treatment",
    "Step 4 treatment",
    "Step 5 treatment"
  ],
  "prevention": "How to prevent this in the future"
}

If the image is not a plant leaf, return:
{
  "disease": "Not a plant image",
  "confidence": 0,
  "description": "Please upload a clear image of a plant leaf for diagnosis",
  "severity": "low",
  "treatment": [],
  "prevention": ""
}`;

    // Build the message with image
    const imageContent = imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageContent } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI Vision error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI Vision service temporarily unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content || "";
    
    let diagnosis;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      diagnosis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      diagnosis = {
        disease: "Analysis Error",
        confidence: 0,
        description: rawText,
        severity: "low",
        treatment: [],
        prevention: "",
      };
    }
>>>>>>> 7d96f724218d846c0d47fe2311c66db07aa275df

    return new Response(JSON.stringify({ diagnosis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
<<<<<<< HEAD

  } catch (e) {
    console.error("Critical Error:", e.message);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
=======
  } catch (e) {
    console.error("crop-doctor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
>>>>>>> 7d96f724218d846c0d47fe2311c66db07aa275df

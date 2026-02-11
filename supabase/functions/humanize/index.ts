import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, tone = "professional", intensity = 2 } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const intensityMap: Record<number, string> = {
      1: "Make minimal changes. Slightly vary sentence structure and word choice while keeping the text very close to the original.",
      2: "Make moderate changes. Restructure sentences, vary vocabulary, add natural transitions, and introduce some informal elements while preserving meaning.",
      3: "Make significant changes. Completely rephrase the content with varied sentence lengths, colloquial expressions, personal voice, rhetorical questions, and natural imperfections while maintaining factual accuracy.",
    };

    const toneInstructions: Record<string, string> = {
      professional: "Use a professional but natural tone. Avoid robotic formality—write like an experienced professional would in an email or report.",
      casual: "Use a relaxed, conversational tone. Include contractions, informal expressions, and write like you're explaining to a friend.",
      academic: "Use an academic tone with proper citations style and scholarly vocabulary, but vary sentence structure and avoid the overly uniform patterns typical of AI.",
      creative: "Use a creative, engaging tone with vivid language, metaphors, varied rhythm, and a distinctive personal voice.",
    };

    const systemPrompt = `You are a text humanization expert. Your task is to rewrite AI-generated text so it reads as naturally human-written.

TONE: ${toneInstructions[tone] || toneInstructions.professional}

INTENSITY: ${intensityMap[intensity] || intensityMap[2]}

Key techniques:
- Vary sentence length dramatically (mix short punchy sentences with longer complex ones)
- Use contractions naturally
- Add transitional phrases that feel organic, not formulaic
- Include occasional colloquialisms appropriate to the tone
- Introduce slight imperfections (starting a sentence with "And" or "But", using dashes)
- Avoid AI-typical phrases: "Furthermore", "Moreover", "It's important to note", "In conclusion"
- Maintain all factual content and original meaning
- Make the text feel like it has a genuine human voice behind it

Output ONLY the rewritten text. No explanations, no meta-commentary.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Rewrite the following text:\n\n${text}` },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("Humanization failed");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("humanize error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

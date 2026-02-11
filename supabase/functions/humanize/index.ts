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
      1: "Make subtle changes. Lightly adjust phrasing and word choice. Keep structure mostly intact but break any robotic patterns.",
      2: "Rewrite substantially. Restructure most sentences, swap vocabulary, add personal touches, vary rhythm significantly. The output should feel like a different person wrote it.",
      3: "Completely rewrite from scratch. Use the original only as a reference for facts and ideas. Write as if you're a human expert explaining these ideas in your own unique voice with your own examples, anecdotes, and opinions woven in.",
    };

    const toneInstructions: Record<string, string> = {
      professional: "Write like a seasoned professional drafting a thoughtful email or LinkedIn post. Natural authority, occasional first-person, direct but not stiff.",
      casual: "Write like you're texting a smart friend. Contractions everywhere, sentence fragments are fine, throw in the occasional 'honestly' or 'look'. Be real.",
      academic: "Write like a grad student who actually understands the material—not like a textbook. Use proper terminology but explain things in your own words. Vary between formal analysis and more accessible phrasing.",
      creative: "Write with flair. Use unexpected metaphors, play with rhythm, let personality shine through. Think essayist, not encyclopedia.",
    };

    const systemPrompt = `You are a human writer. Not an AI pretending to be human—you write exactly like a real person does.

VOICE & TONE: ${toneInstructions[tone] || toneInstructions.professional}

TRANSFORMATION LEVEL: ${intensityMap[intensity] || intensityMap[2]}

CRITICAL RULES — follow these precisely to avoid AI detection:

1. SENTENCE STRUCTURE: Humans write messily. Mix very short sentences (3-5 words) with long, winding ones. Start some sentences with "And", "But", "So", "Look,", "Thing is,". Use sentence fragments occasionally. Never write 3+ sentences of similar length in a row.

2. WORD CHOICE: Replace formal/AI words with natural alternatives:
   - "utilize" → "use", "implement" → "set up" or "put in place"  
   - "significant" → "big" or "major", "facilitate" → "help" or "make easier"
   - "comprehensive" → "thorough" or "complete", "leverage" → "use" or "take advantage of"
   - "enhance" → "improve" or "boost", "optimal" → "best" or "ideal"
   - NEVER use: "delve", "crucial", "pivotal", "landscape", "tapestry", "multifaceted", "nuanced", "paradigm", "synergy", "holistic", "robust", "streamline", "innovative", "cutting-edge", "game-changer", "realm"

3. TRANSITIONS: Never use "Furthermore", "Moreover", "Additionally", "In addition", "It is worth noting", "It's important to note", "In conclusion", "To summarize", "In summary". Instead use natural bridges like repeating a keyword, asking a rhetorical question, or just starting the next thought directly.

4. PARAGRAPH RHYTHM: Vary paragraph lengths wildly. Some paragraphs should be 1-2 sentences. Others can be 4-6. Never make them all the same length.

5. HUMAN IMPERFECTIONS: Include these naturally:
   - Parenthetical asides (like this one)
   - Em dashes—they break up thoughts nicely
   - Occasional rhetorical questions. Why? Because real people ask them.
   - Starting sentences with conjunctions
   - Mild hedging: "probably", "I think", "tends to", "in most cases"

6. SPECIFICITY: Where the original uses vague claims, add slightly more specific (but still accurate) framing. Humans tend to ground abstract points.

7. ABSOLUTELY NO: Lists of exactly 3 or 5 parallel items with identical grammatical structure. That's the #1 AI tell. If you must list things, make the items different lengths and structures.

8. FLOW: Read the text aloud mentally. If it sounds like a Wikipedia article or corporate press release, rewrite it. It should sound like a smart person talking.

Output ONLY the rewritten text. No preamble, no "Here's the rewritten version", no commentary.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Rewrite this text so it sounds completely human-written. Focus on making it undetectable by AI detection tools:\n\n${text}` },
        ],
        stream: true,
        temperature: 1.0,
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

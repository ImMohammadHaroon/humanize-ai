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

    const systemPrompt = `You are NOT an AI assistant. You are a real human writer who has been asked to rewrite a piece of text in your own words. You have opinions, you make mistakes sometimes, and you write the way people actually talk and write in real life.

VOICE & TONE: ${toneInstructions[tone] || toneInstructions.professional}

TRANSFORMATION LEVEL: ${intensityMap[intensity] || intensityMap[2]}

YOUR WRITING PERSONALITY:
- You sometimes go off on brief tangents before circling back
- You have preferences and aren't afraid to show mild bias ("honestly, this is the part that gets interesting")
- You occasionally correct yourself mid-thought ("well, actually, that's not quite right—")
- You reference common experiences casually

HARD RULES TO BYPASS AI DETECTORS:

1. PERPLEXITY MANIPULATION: AI text has low perplexity (predictable next words). You MUST increase unpredictability:
   - Use uncommon word pairings and unexpected adjectives
   - Interrupt expected sentence patterns mid-way
   - Switch registers within the same paragraph (formal → casual → back)
   - Use idioms, slang, or domain-specific jargon mixed with plain language

2. BURSTINESS: AI writes uniform sentences. You MUST create extreme variation:
   - Include at least 2 sentences under 6 words per paragraph
   - Include at least 1 sentence over 25 words per paragraph  
   - Single-word or two-word sentences are fine. Absolutely.
   - Some paragraphs should be just ONE sentence

3. BANNED PATTERNS — using ANY of these will get flagged:
   WORDS: "delve", "crucial", "pivotal", "landscape", "tapestry", "multifaceted", "nuanced", "paradigm", "synergy", "holistic", "robust", "streamline", "innovative", "cutting-edge", "game-changer", "realm", "foster", "utilize", "facilitate", "comprehensive", "leverage", "optimal", "enhance", "underscore", "commendable", "meticulous", "intricate", "noteworthy", "advent"
   TRANSITIONS: "Furthermore", "Moreover", "Additionally", "In addition", "It is worth noting", "It's important to note", "In conclusion", "To summarize", "In summary", "This is because", "As a result", "Consequently", "Nevertheless", "Nonetheless"
   STRUCTURES: Three or more parallel items with matching grammar. Sentences starting with "This [verb]s..." back to back. Lists where every item is the same length.

4. NATURAL HUMAN MARKERS — sprinkle these throughout:
   - Contractions (it's, doesn't, won't, can't, they're, we've)
   - Sentence-initial conjunctions (And, But, So, Or, Yet)
   - Dashes for interruption—like this—instead of semicolons
   - Parenthetical thoughts (just quick ones)
   - Rhetorical questions scattered naturally
   - First person where appropriate ("I think", "from what I've seen", "in my experience")
   - Hedging language ("probably", "tends to", "more or less", "roughly", "kind of")
   - Colloquial connectors ("the thing is", "here's the deal", "point being", "bottom line")
   - Occasional emphasis with italics-style phrasing ("really", "actually", "literally")

5. STRUCTURE BREAKING:
   - Don't follow intro → body → conclusion format
   - Start with the most interesting point, not a general statement
   - End abruptly or with a question—don't wrap things up neatly
   - Jump between related ideas naturally instead of rigid paragraph-per-topic

6. WORD REPLACEMENTS (always apply):
   - "significant" → "big", "major", "pretty huge"
   - "implement" → "set up", "roll out", "get going", "build"
   - "demonstrate" → "show", "prove", "make clear"
   - "individuals" → "people", "folks"
   - "obtain" → "get", "grab", "pick up"
   - "possess" → "have", "carry"
   - "commence" → "start", "kick off", "begin"
   - "endeavor" → "try", "effort", "attempt"
   - "subsequent" → "next", "later", "after that"
   - "prior to" → "before"
   - "in order to" → "to"
   - "a large number of" → "lots of", "a ton of", "plenty of"

Output ONLY the rewritten text. Nothing else. No intro like "Here's..." or "Sure...". Just the text.`;

    // First pass: deep rewrite
    const firstPassResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Here's a text that was written by AI. Rewrite it completely in your own human voice. Don't just paraphrase—actually think about what it's saying and write it the way YOU would explain it to someone:\n\n${text}` },
        ],
        temperature: 1.2,
        top_p: 0.9,
      }),
    });

    if (!firstPassResponse.ok) {
      if (firstPassResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (firstPassResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Credits required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await firstPassResponse.text();
      console.error("AI gateway error (pass 1):", firstPassResponse.status, t);
      throw new Error("Humanization failed");
    }

    const firstPassData = await firstPassResponse.json();
    const firstPassText = firstPassData.choices?.[0]?.message?.content || "";

    // Second pass: polish and add more human noise, streamed to client
    const polishPrompt = `You're doing a final editing pass on a piece of writing. Your ONLY job is to make it sound even MORE naturally human. The text below is close but needs more personality.

Do these specific things:
- Break up any remaining long, complex sentences into shorter ones
- Add 2-3 casual asides or personal observations
- Replace any remaining formal/stiff words with casual ones
- Make sure no two consecutive sentences start the same way
- Add at least one rhetorical question somewhere
- Ensure contractions are used everywhere possible
- If the text starts with a generic opening, replace it with something punchy or mid-thought
- Make the ending feel natural—not like a summary. Maybe end on a thought, a question, or a casual observation.

Keep the same meaning and facts. Output ONLY the final text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: polishPrompt },
          { role: "user", content: firstPassText },
        ],
        stream: true,
        temperature: 1.1,
        top_p: 0.85,
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

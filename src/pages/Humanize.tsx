import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Loader2, RotateCcw, CheckCircle, Copy, Check } from "lucide-react";
import { Label } from "@/components/ui/label";

const TONES = ["professional", "casual", "academic", "creative"] as const;
const INTENSITY_LABELS: Record<number, string> = { 1: "Low", 2: "Medium", 3: "High" };

export default function Humanize() {
  const [inputText, setInputText] = useState("");
  const [humanizedText, setHumanizedText] = useState("");
  const [tone, setTone] = useState<string>("professional");
  const [intensity, setIntensity] = useState([2]);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detectionScore, setDetectionScore] = useState<number | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(humanizedText);
    setCopied(true);
    toast({ title: "Copied!", description: "Humanized text copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  const handleHumanize = async (text?: string) => {
    const sourceText = text || inputText;
    if (!sourceText.trim() || !user) return;
    if (wordCount > 5000 && !text) {
      toast({ title: "Too long", description: "Max 5,000 words.", variant: "destructive" });
      return;
    }

    setLoading(true);
    setHumanizedText("");
    setDetectionScore(null);

    try {
      abortRef.current = new AbortController();
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/humanize`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text: sourceText, tone, intensity: intensity[0] }),
        signal: abortRef.current.signal,
      });

      if (!resp.ok) {
        if (resp.status === 429) { toast({ title: "Rate limited", description: "Please try again later.", variant: "destructive" }); return; }
        if (resp.status === 402) { toast({ title: "Credits required", description: "Please add credits to continue.", variant: "destructive" }); return; }
        throw new Error("Humanization failed");
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setHumanizedText(fullText);
            }
          } catch {}
        }
      }

      // Auto-detect the humanized text
      setDetecting(true);
      const detectResp = await supabase.functions.invoke("detect", { body: { text: fullText } });
      if (detectResp.data) {
        setDetectionScore(detectResp.data.overallScore);
      }

      // Save analysis
      await supabase.from("analyses").insert({
        user_id: user.id,
        input_text: sourceText,
        humanized_text: fullText,
        detection_score: null,
        humanized_detection_score: detectResp.data?.overallScore ?? null,
        tone,
        intensity: INTENSITY_LABELS[intensity[0]],
        status: "humanized",
      });
    } catch (err: any) {
      if (err.name !== "AbortError") {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    } finally {
      setLoading(false);
      setDetecting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score <= 30) return "text-ai-low";
    if (score <= 60) return "text-ai-medium";
    return "text-ai-high";
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Text Humanizer</h1>
        <p className="text-muted-foreground mt-1">Transform AI-generated text into natural human writing</p>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-6 flex flex-wrap gap-6 items-end">
          <div className="space-y-2 min-w-[160px]">
            <Label>Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 min-w-[200px] flex-1 max-w-xs">
            <Label>Intensity: {INTENSITY_LABELS[intensity[0]]}</Label>
            <Slider value={intensity} onValueChange={setIntensity} min={1} max={3} step={1} />
          </div>
        </CardContent>
      </Card>

      {/* Side by side */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Original Text</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste your AI-generated text here..."
              className="min-h-[300px] resize-y font-mono text-sm"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-muted-foreground">{wordCount} / 5,000 words</span>
              <Button onClick={() => handleHumanize()} disabled={loading || !inputText.trim()} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                {loading ? "Humanizing..." : "Humanize"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Humanized Output</CardTitle>
            {detectionScore !== null && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">AI Score:</span>
                <span className={`font-bold ${getScoreColor(detectionScore)}`}>{detectionScore}%</span>
                {detectionScore <= 30 && <CheckCircle className="h-4 w-4 text-ai-low" />}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="min-h-[300px] rounded-md border border-input bg-muted/30 p-4 font-mono text-sm whitespace-pre-wrap">
              {humanizedText || (
                <span className="text-muted-foreground italic">Humanized text will appear here...</span>
              )}
              {loading && <span className="animate-pulse-glow">▊</span>}
            </div>
            {humanizedText && !loading && (
              <div className="flex justify-end gap-2 mt-3">
                {detecting && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Verifying...
                  </span>
                )}
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                {detectionScore !== null && detectionScore > 30 && (
                  <Button variant="outline" size="sm" onClick={() => handleHumanize(humanizedText)} className="gap-2">
                    <RotateCcw className="h-3 w-3" />
                    Re-humanize
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress indicator */}
      {detectionScore !== null && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Human Score</span>
              <span className={`text-sm font-bold ${getScoreColor(detectionScore)}`}>
                {100 - detectionScore}% Human
              </span>
            </div>
            <Progress value={100 - detectionScore} className="h-3" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

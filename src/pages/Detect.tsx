import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2 } from "lucide-react";

interface SentenceResult {
  text: string;
  score: number; // 0-100
}

interface DetectionResult {
  overallScore: number;
  perplexity: number;
  burstiness: number;
  sentences: SentenceResult[];
}

export default function Detect() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  const handleDetect = async () => {
    if (!inputText.trim() || !user) return;
    if (wordCount > 5000) {
      toast({ title: "Too long", description: "Max 5,000 words.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const resp = await supabase.functions.invoke("detect", {
        body: { text: inputText },
      });
      if (resp.error) throw new Error(resp.error.message);
      const data = resp.data as DetectionResult;
      setResult(data);

      // Save to DB
      await supabase.from("analyses").insert({
        user_id: user.id,
        input_text: inputText,
        detection_score: data.overallScore,
        detection_result: data as any,
        status: "detected",
      });
    } catch (err: any) {
      toast({ title: "Detection failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getColor = (score: number) => {
    if (score >= 70) return "bg-ai-high/20 border-ai-high/40 text-foreground";
    if (score >= 40) return "bg-ai-medium/20 border-ai-medium/40 text-foreground";
    return "bg-ai-low/20 border-ai-low/40 text-foreground";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 70) return { label: "Likely AI", color: "text-ai-high" };
    if (score >= 40) return { label: "Mixed", color: "text-ai-medium" };
    return { label: "Likely Human", color: "text-ai-low" };
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Content Detector</h1>
        <p className="text-muted-foreground mt-1">Analyze text for AI-generated patterns</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="relative">
            <Textarea
              placeholder="Paste your text here to analyze for AI patterns..."
              className="min-h-[200px] resize-y font-mono text-sm"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
              {wordCount} / 5,000 words
            </div>
          </div>
          <Button onClick={handleDetect} disabled={loading || !inputText.trim()} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {loading ? "Analyzing..." : "Detect AI Content"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Score Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Detection Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className={`text-5xl font-bold ${getScoreLabel(result.overallScore).color}`}>
                  {result.overallScore}%
                </div>
                <p className={`text-sm font-medium mt-1 ${getScoreLabel(result.overallScore).color}`}>
                  {getScoreLabel(result.overallScore).label}
                </p>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">AI Probability</span>
                    <span className="font-medium">{result.overallScore}%</span>
                  </div>
                  <Progress value={result.overallScore} className="h-2" />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Perplexity</span>
                  <span className="font-mono font-medium">{result.perplexity.toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Burstiness</span>
                  <span className="font-mono font-medium">{result.burstiness.toFixed(1)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Heat Map */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Sentence Analysis</CardTitle>
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-ai-high" /> High AI</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-ai-medium" /> Medium</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-ai-low" /> Human-like</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.sentences.map((s, i) => (
                  <div key={i} className={`rounded-md border p-3 text-sm ${getColor(s.score)}`}>
                    <div className="flex justify-between items-start gap-2">
                      <span>{s.text}</span>
                      <span className="shrink-0 font-mono text-xs font-medium">{s.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

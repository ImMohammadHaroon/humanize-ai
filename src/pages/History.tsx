import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Analysis {
  id: string;
  input_text: string;
  humanized_text: string | null;
  detection_score: number | null;
  humanized_detection_score: number | null;
  tone: string | null;
  intensity: string | null;
  status: string | null;
  created_at: string;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("analyses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setAnalyses((data as Analysis[]) || []);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">History</h1>
        <p className="text-muted-foreground mt-1">Your past analyses and humanizations</p>
      </div>

      {analyses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            No analyses yet. Start by detecting or humanizing some text!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {analyses.map((a) => (
            <Card key={a.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={a.status === "humanized" ? "default" : "secondary"}>
                      {a.status}
                    </Badge>
                    {a.tone && <Badge variant="outline" className="capitalize">{a.tone}</Badge>}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(a.created_at), "MMM d, yyyy h:mm a")}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm line-clamp-3">{a.input_text}</p>
                {a.detection_score != null && (
                  <p className="text-xs text-muted-foreground mt-2">AI Score: {a.detection_score}%</p>
                )}
                {a.humanized_detection_score != null && (
                  <p className="text-xs text-muted-foreground">After humanization: {a.humanized_detection_score}%</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

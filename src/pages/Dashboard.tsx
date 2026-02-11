import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Wand2, TrendingDown, Clock } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, avgScore: 0, humanized: 0 });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("analyses")
      .select("*")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (!data) return;
        const humanized = data.filter((a) => a.humanized_text).length;
        const scores = data.filter((a) => a.detection_score != null).map((a) => Number(a.detection_score));
        const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        setStats({ total: data.length, avgScore: Math.round(avg), humanized });
      });
  }, [user]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back. Here's your activity overview.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Analyses</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg AI Score</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgScore}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Humanized</CardTitle>
            <Wand2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.humanized}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="group hover:border-primary/30 transition-colors cursor-pointer">
          <Link to="/detect">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                <Search className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold">AI Detector</h3>
                <p className="text-sm text-muted-foreground">Analyze text for AI patterns</p>
              </div>
            </CardContent>
          </Link>
        </Card>
        <Card className="group hover:border-primary/30 transition-colors cursor-pointer">
          <Link to="/humanize">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Wand2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Humanizer</h3>
                <p className="text-sm text-muted-foreground">Transform AI text to human-like</p>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}

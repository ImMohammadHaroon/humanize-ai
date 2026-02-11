import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Wand2, TrendingDown, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

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

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div className="space-y-8" variants={container} initial="hidden" animate="show">
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back. Here's your activity overview.</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Total Analyses", value: stats.total, icon: Clock, gradient: "from-primary/10 to-primary/5" },
          { label: "Avg AI Score", value: `${stats.avgScore}%`, icon: TrendingDown, gradient: "from-warning/10 to-warning/5" },
          { label: "Humanized", value: stats.humanized, icon: Wand2, gradient: "from-accent/10 to-accent/5" },
        ].map((stat, i) => (
          <motion.div key={stat.label} variants={item}>
            <Card className={`bg-gradient-to-br ${stat.gradient} border-border/50 hover:shadow-md transition-shadow`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div className="grid gap-4 sm:grid-cols-2" variants={item}>
        <Link to="/detect" className="group">
          <Card className="h-full border-border/50 hover:border-destructive/30 hover:shadow-lg transition-all duration-300">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 group-hover:bg-destructive/20 transition-colors">
                  <Search className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Detector</h3>
                  <p className="text-sm text-muted-foreground">Analyze text for AI patterns</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-destructive group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </Link>
        <Link to="/humanize" className="group">
          <Card className="h-full border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Wand2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Humanizer</h3>
                  <p className="text-sm text-muted-foreground">Transform AI text to human-like</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    </motion.div>
  );
}

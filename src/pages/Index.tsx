import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <span className="text-lg font-bold">HumanizeAI</span>
        </div>
        <div>
          {user ? (
            <Button asChild><Link to="/dashboard">Dashboard</Link></Button>
          ) : (
            <Button asChild><Link to="/auth">Get Started</Link></Button>
          )}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-2xl text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
            Make AI Text
            <br />
            <span className="text-primary">Undetectable</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Detect AI-generated content and transform it into natural, human-like writing that passes every detection tool.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to={user ? "/humanize" : "/auth"}>Start Humanizing</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to={user ? "/detect" : "/auth"}>Detect AI</Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t border-border px-6 py-4 text-center text-sm text-muted-foreground">
        © 2026 HumanizeAI. All rights reserved.
      </footer>
    </div>
  );
}

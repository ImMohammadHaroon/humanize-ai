import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import {
  Search,
  Wand2,
  RotateCcw,
  Shield,
  Zap,
  ChevronRight,
  
  Star,
  ArrowRight,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

export default function Index() {
  const { user } = useAuth();
  const cta = user ? "/humanize" : "/auth";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ─── NAV ─── */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <img src="/favicon.png" alt="DevOwl" className="h-8 w-8 rounded-lg" />
            <span className="text-lg font-bold tracking-tight">DevOwl Humanizer</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <Button asChild><Link to="/dashboard">Dashboard</Link></Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex"><Link to="/auth">Sign In</Link></Button>
                <Button asChild><Link to="/auth">Get Started Free</Link></Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[300px] w-[400px] rounded-full bg-accent/5 blur-3xl" />
        </div>

        <motion.div
          className="mx-auto max-w-6xl px-6 pb-20 pt-20 md:pt-28 text-center"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeUp} className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Zap className="h-3.5 w-3.5" />
              Trusted by 10,000+ writers
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.08]">
            Make Your AI Text
            <br />
            <span className="text-primary">100% Human</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
            The smartest AI humanizer that rewrites your content to pass every detection tool—Originality.ai, GPTZero, Turnitin. Zero flags. Every time.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="h-13 px-8 text-base gap-2 shadow-lg shadow-primary/20" asChild>
              <Link to={cta}>
                Start Humanizing Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-13 px-8 text-base" asChild>
              <Link to={user ? "/detect" : "/auth"}>Try AI Detector</Link>
            </Button>
          </motion.div>

          {/* Social proof */}
          <motion.div variants={fadeUp} className="mt-14 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-warning text-warning" />
              ))}
              <span className="ml-2 font-medium">4.9/5</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <span>10,000+ texts humanized</span>
            <div className="h-4 w-px bg-border" />
            <span>98% bypass rate</span>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="border-t border-border/60 bg-card/50">
        <motion.div
          className="mx-auto max-w-6xl px-6 py-24"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Everything you need to beat AI detectors</h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              Three powerful tools working together to make your content undetectable.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Search,
                title: "AI Content Detector",
                desc: "Analyze any text with sentence-level heat maps showing exactly which parts trigger AI flags. See perplexity & burstiness scores in real-time.",
                color: "bg-destructive/10 text-destructive",
              },
              {
                icon: Wand2,
                title: "Smart Humanizer",
                desc: "Two-pass AI rewriting engine that transforms robotic text into natural human writing. Choose your tone, set intensity, and watch it stream live.",
                color: "bg-primary/10 text-primary",
              },
              {
                icon: RotateCcw,
                title: "Iterative Refinement",
                desc: "Automatically re-scans your humanized text. Still flagging? One click to re-humanize specific sections until you hit 100% human.",
                color: "bg-accent/10 text-accent",
              },
            ].map((f, i) => (
              <motion.div key={f.title} variants={fadeUp}>
                <Card className="h-full border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-8">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${f.color} mb-5 group-hover:scale-110 transition-transform`}>
                      <f.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="border-t border-border/60">
        <motion.div
          className="mx-auto max-w-6xl px-6 py-24"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How it works</h2>
            <p className="mt-4 text-muted-foreground">Three steps. Under 30 seconds. That's it.</p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: "01", title: "Paste Your Text", desc: "Drop your AI-generated text into the editor. Supports up to 5,000 words per analysis." },
              { step: "02", title: "Choose & Humanize", desc: "Pick your tone and intensity. Our two-pass AI engine rewrites every sentence with natural human patterns." },
              { step: "03", title: "Verify & Copy", desc: "Auto-detection runs instantly. See your new human score, refine if needed, then copy with one click." },
            ].map((s) => (
              <motion.div key={s.step} variants={fadeUp} className="relative">
                <div className="text-6xl font-bold text-primary/10 mb-4">{s.step}</div>
                <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="border-t border-border/60 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "98%", label: "Bypass Rate" },
              { value: "10K+", label: "Users" },
              { value: "<30s", label: "Avg Processing" },
              { value: "4.9★", label: "User Rating" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl md:text-4xl font-bold">{s.value}</div>
                <div className="text-sm mt-1 opacity-80">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>




      {/* ─── TESTIMONIALS ─── */}
      <section className="border-t border-border/60 bg-card/50">
        <motion.div
          className="mx-auto max-w-6xl px-6 py-24"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Loved by writers everywhere</h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: "Sarah K.", role: "Content Writer", quote: "I was skeptical at first, but DevOwl consistently gets my content past Originality.ai. The two-pass engine is a game changer for my workflow." },
              { name: "James M.", role: "Graduate Student", quote: "The academic tone setting is perfect. It keeps the scholarly feel while making the text genuinely mine. My advisor can't tell the difference." },
              { name: "Priya R.", role: "Marketing Lead", quote: "We run every piece of content through DevOwl before publishing. The iterative refinement loop means nothing slips through. Worth every penny." },
            ].map((t) => (
              <motion.div key={t.name} variants={fadeUp}>
                <Card className="h-full border-border/50">
                  <CardContent className="p-8">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground mb-6">"{t.quote}"</p>
                    <div>
                      <div className="font-semibold text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Ready to make your content undetectable?
          </h2>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto">
            Join thousands of writers who trust DevOwl to humanize their AI content.
          </p>
          <Button size="lg" className="mt-8 h-13 px-8 text-base gap-2 shadow-lg shadow-primary/20" asChild>
            <Link to={cta}>
              Get Started Free
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border/60 bg-card/30">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <img src="/favicon.png" alt="DevOwl" className="h-7 w-7 rounded-md" />
              <span className="font-bold">DevOwl Humanizer</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
              <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 DevOwl Humanizer</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, Image, Leaf, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LandingPage() {
  const { login, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isLoggingIn = loginStatus === "logging-in";

  const handleLogin = async () => {
    try {
      await login();
      queryClient.clear();
    } catch {
      // ignore
    }
  };

  const features = [
    {
      icon: BookOpen,
      title: "Daily Reflections",
      desc: "Write as many entries as you need for each day. Your diary, your rhythm.",
    },
    {
      icon: Image,
      title: "Photos & Memories",
      desc: "Attach photos to your entries and build a visual archive of your life.",
    },
    {
      icon: Leaf,
      title: "Mood & Tags",
      desc: "Track how you feel each day and organise entries with custom tags.",
    },
    {
      icon: Shield,
      title: "Fully Private",
      desc: "Your entries are stored on the blockchain. Only you can read them.",
    },
  ];

  return (
    <div className="min-h-screen bg-background paper-texture">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/tree-icon-transparent.dim_80x80.png"
              alt=""
              className="w-8 h-8 object-contain"
            />
            <span className="font-display text-xl font-semibold text-foreground tracking-tight">
              Heartwood Journal
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              Features
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-ocid="nav.signin.button"
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="px-5 py-2 rounded-full border border-border bg-secondary text-secondary-foreground text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
            >
              Sign In
            </button>
            <button
              type="button"
              data-ocid="nav.get_started.button"
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoggingIn ? "Signing in..." : "Get Started"}
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Leaf size={14} />
                Your private sanctuary
              </div>
              <h1 className="font-display text-5xl lg:text-6xl font-bold leading-tight text-foreground">
                A place for your
                <span className="text-primary italic"> innermost</span>
                <br />
                thoughts
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                Heartwood Journal is your warm, private diary. Write freely,
                track your moods, attach photos, and revisit memories through a
                beautiful calendar.
              </p>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  data-ocid="hero.start_journal.button"
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity shadow-card disabled:opacity-50"
                >
                  {isLoggingIn
                    ? "Opening your journal..."
                    : "Start Your Journal"}
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                Free &amp; completely private. Secured by the Internet Computer.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
              className="relative"
            >
              <div className="rounded-3xl overflow-hidden shadow-card-hover border border-border/50">
                <img
                  src="/assets/generated/hero-journaling.dim_900x600.png"
                  alt="Woman journaling by a window"
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-card rounded-2xl px-5 py-3 shadow-card border border-border">
                <p className="text-xs text-muted-foreground mb-0.5">
                  Today&apos;s mood
                </p>
                <p className="text-lg">🧘 Calm &amp; focused</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="max-w-6xl mx-auto px-6 py-16">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-display text-3xl font-bold text-center mb-12 text-foreground"
          >
            Everything your diary needs
          </motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-card border border-border/50 space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <f.icon size={20} className="text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-muted/40 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

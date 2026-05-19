import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Sparkles, BarChart3, Target, Bot, BookOpen, Wallet } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Moneti — Clarity for your financial life" },
      { name: "description", content: "Track net worth, manage spending, set goals, and grow wealth with an AI finance coach — all in one calm interface." },
      { property: "og:title", content: "Moneti — Clarity for your financial life" },
      { property: "og:description", content: "Track net worth, manage spending, set goals, and grow wealth with an AI finance coach." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-sage-100">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-black/5 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-lg font-semibold tracking-tight text-sage-700">Moneti</Link>
            <div className="hidden gap-6 sm:flex">
              <a href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Features</a>
              <a href="#testimonial" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Members</a>
              <Link to="/tips" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Journal</Link>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-muted-foreground">Log in</Link>
            <Link to="/signup" className="rounded-full bg-sage-600 px-5 py-2 text-sm font-medium text-primary-foreground transition-transform active:scale-95">Get started</Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="overflow-hidden py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
              <div className="flex flex-col">
                <span className="mb-6 inline-flex w-fit items-center rounded-full bg-sage-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-sage-700">
                  Private Beta
                </span>
                <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                  Clarity for your <br /> financial life
                </h1>
                <p className="mt-8 max-w-[48ch] text-pretty text-lg leading-relaxed text-muted-foreground">
                  The tool for those who value composition over noise. Track net worth, manage spending, and grow your wealth through a singular, calm interface.
                </p>
                <div className="mt-10 flex items-center gap-4">
                  <Link to="/signup" className="flex items-center gap-2 rounded-full bg-foreground py-2 pl-5 pr-2 text-sm font-medium text-background ring-1 ring-foreground transition-transform active:scale-95">
                    Start your journey
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-background/10">
                      <ArrowUpRight className="size-3.5" />
                    </span>
                  </Link>
                  <div className="flex -space-x-2">
                    <div className="size-8 rounded-full bg-sage-200 ring-2 ring-background" />
                    <div className="size-8 rounded-full bg-sage-500 ring-2 ring-background" />
                    <div className="size-8 rounded-full bg-sage-700 ring-2 ring-background" />
                  </div>
                  <p className="text-sm text-muted-foreground">Join 12,000+ members</p>
                </div>
              </div>

              {/* Dashboard preview */}
              <div className="relative">
                <div className="rounded-2xl bg-card p-6 ring-1 ring-black/5 shadow-2xl shadow-zinc-200/50 dark:shadow-black/40">
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Balance</p>
                      <p className="mt-1 text-3xl font-medium tabular-nums">$142,508.32</p>
                    </div>
                    <div className="flex items-end gap-1">
                      <div className="h-4 w-1 rounded-full bg-sage-100" />
                      <div className="h-6 w-1 rounded-full bg-sage-100" />
                      <div className="h-8 w-1 rounded-full bg-sage-600" />
                      <div className="h-5 w-1 rounded-full bg-sage-100" />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex h-32 w-full items-end gap-2">
                      <div className="w-full rounded-t-md bg-sage-50" style={{ height: "40%" }} />
                      <div className="w-full rounded-t-md bg-sage-50" style={{ height: "60%" }} />
                      <div className="w-full rounded-t-md bg-sage-100" style={{ height: "55%" }} />
                      <div className="w-full rounded-t-md bg-sage-600" style={{ height: "85%" }} />
                      <div className="w-full rounded-t-md bg-sage-100" style={{ height: "70%" }} />
                      <div className="w-full rounded-t-md bg-sage-50" style={{ height: "45%" }} />
                    </div>

                    <div className="divide-y divide-black/5">
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className="grid size-8 place-items-center rounded-lg bg-muted ring-1 ring-black/5">
                            <Wallet className="size-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Apple Store</p>
                            <p className="text-xs text-muted-foreground">Electronics</p>
                          </div>
                        </div>
                        <p className="text-sm font-medium tabular-nums text-muted-foreground">-$129.00</p>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className="grid size-8 place-items-center rounded-lg bg-muted ring-1 ring-black/5">
                            <Sparkles className="size-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Dividend Payout</p>
                            <p className="text-xs text-muted-foreground">Vanguard ETF</p>
                          </div>
                        </div>
                        <p className="text-sm font-medium tabular-nums text-emerald-600">+$452.18</p>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -bottom-6 -left-6 max-w-[260px] rounded-2xl bg-sage-600 p-4 text-primary-foreground shadow-xl ring-1 ring-black/5">
                    <p className="mb-1 text-xs font-medium opacity-80">Moneti AI Coach</p>
                    <p className="text-sm leading-snug">
                      "You're on track to hit your $50k savings goal 2 months early. Want to increase your ETF contribution?"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-y border-black/5 bg-card py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-16">
              <h2 className="text-balance text-3xl font-medium tracking-tight">Built for intentionality</h2>
              <p className="mt-3 max-w-xl text-muted-foreground">Six surfaces, one calm system — designed so you spend minutes, not hours, on your money.</p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.title} className="group">
                  <div className="mb-6 grid aspect-video place-items-center overflow-hidden rounded-2xl bg-sage-50/60 ring-1 ring-black/5">
                    <f.icon className="size-10 text-sage-600" strokeWidth={1.25} />
                  </div>
                  <h3 className="text-lg font-medium">{f.title}</h3>
                  <p className="mt-3 max-w-[40ch] text-pretty text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section id="testimonial" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-[56ch] text-center">
              <p className="text-xl font-medium italic leading-relaxed text-foreground">
                "Managing money used to feel like a chore I was failing. Moneti turned it into a quiet ritual I actually look forward to every Sunday morning."
              </p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <div className="grid size-10 place-items-center rounded-full bg-sage-100 text-sm font-medium text-sage-700 ring-1 ring-black/5">JT</div>
                <div className="text-left">
                  <p className="text-sm font-semibold">Julian Thorne</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Creative Director</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="rounded-3xl bg-sage-600 px-8 py-16 text-center text-primary-foreground ring-1 ring-sage-600">
              <h2 className="text-balance text-3xl font-medium tracking-tight sm:text-4xl">Ready to start your clarity phase?</h2>
              <p className="mx-auto mt-6 max-w-[40ch] text-pretty text-primary-foreground/80">
                Join the community of intentional spenders. Secure, private, and beautifully simple.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Link to="/signup" className="rounded-full bg-background px-8 py-3 text-sm font-medium text-sage-700 shadow-sm transition-transform active:scale-95">Open your account</Link>
                <Link to="/login" className="rounded-full bg-sage-700/50 px-8 py-3 text-sm font-medium text-primary-foreground ring-1 ring-background/10 transition-transform active:scale-95">I already have an account</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/5 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-6 md:flex-row">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">© 2026 Moneti Group Inc.</p>
          <div className="flex gap-8">
            <a href="#" className="text-xs font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground">Privacy</a>
            <a href="#" className="text-xs font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground">Terms</a>
            <a href="#" className="text-xs font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const FEATURES = [
  { title: "Unified Dashboard", desc: "Balance, income, expenses, net worth and a financial health score — visible at a glance.", icon: BarChart3 },
  { title: "Smart Budgeting", desc: "Custom categories with monthly limits, friendly alerts, and effortless exports.", icon: Wallet },
  { title: "Goals & Forecasts", desc: "Visualize your progress toward every goal and project where your net worth lands next year.", icon: Target },
  { title: "AI Finance Coach", desc: "A private assistant for budgeting, saving, and investing — answers grounded in your real data.", icon: Bot },
  { title: "Investment Explorer", desc: "Beginner-friendly explanations for ETFs, stocks, bonds and more. Plain English. Real labels.", icon: Sparkles },
  { title: "Tips Hub", desc: "A growing library of short, searchable finance lessons. Read one a week. Compound for life.", icon: BookOpen },
];

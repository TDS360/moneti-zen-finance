import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";

export const Route = createFileRoute("/_app/tips")({ component: TipsPage });

const TIPS = [
  { cat: "Budgeting", title: "The 50/30/20 rule", body: "Spend 50% on needs, 30% on wants, 20% on savings and debt repayment. The simplest budget that survives real life." },
  { cat: "Saving", title: "Pay yourself first", body: "Automate the transfer to savings the day you get paid. If you can't see it, you won't spend it." },
  { cat: "Investing", title: "Time beats timing", body: "Decades in the market matters far more than picking the perfect entry day. Start now, even small." },
  { cat: "Debt", title: "Avalanche vs Snowball", body: "Avalanche pays high-interest debts first (saves the most money). Snowball pays smallest balances first (better psychology)." },
  { cat: "Emergency", title: "3–6 months of expenses", body: "Your emergency fund should cover essential bills for 3–6 months. Keep it in a high-yield savings account." },
  { cat: "Mindset", title: "Compound interest is wild", body: "$200/month invested at 7% becomes $244k in 30 years. Time is the lever, not income." },
  { cat: "Investing", title: "Diversify by default", body: "A total-market index fund owns thousands of companies for one ticker. Lower risk, same long-term returns." },
  { cat: "Saving", title: "The 24-hour rule", body: "Want a non-essential purchase over $100? Wait a day. Most urges fade." },
  { cat: "Credit", title: "Utilization matters", body: "Keep credit-card balances under 30% of your limit to protect your score." },
];

function TipsPage() {
  const [q, setQ] = useState("");
  const filtered = TIPS.filter(t => !q || (t.title + t.body + t.cat).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tips Hub</h1>
        <p className="text-sm text-muted-foreground">Short, durable lessons. Read one a week. Compound for life.</p>
      </div>
      <div className="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2.5">
        <Search className="size-4 text-muted-foreground" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search tips…" className="w-full bg-transparent text-sm outline-none" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(t => (
          <article key={t.title} className="rounded-2xl border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-wider text-sage-700">{t.cat}</p>
            <h3 className="mt-2 text-base font-medium">{t.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

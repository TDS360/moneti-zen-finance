import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/investments")({ component: InvestmentsPage });

const ASSETS = [
  { name: "Index ETFs (e.g. VTI, VOO)", risk: "Low–Medium", desc: "A single fund that owns hundreds of companies. The classic beginner choice — diversified, low fees, long-term growth.", color: "bg-sage-100 text-sage-700" },
  { name: "Bonds & Treasuries", risk: "Low", desc: "You lend money to a government or company in exchange for interest. Slower growth, but the calmest place to park cash.", color: "bg-blue-100 text-blue-700" },
  { name: "Dividend Stocks", risk: "Medium", desc: "Individual companies that pay you a slice of profits regularly. Good for income-focused investors.", color: "bg-amber-100 text-amber-700" },
  { name: "REITs", risk: "Medium", desc: "Funds that invest in real estate. Exposure to property without owning a building yourself.", color: "bg-purple-100 text-purple-700" },
  { name: "Individual Stocks", risk: "High", desc: "Owning shares of one company. Higher upside, higher swings. Best for a small slice of your portfolio.", color: "bg-orange-100 text-orange-700" },
  { name: "Crypto", risk: "Very High", desc: "Digital assets like Bitcoin. Wildly volatile. Treat as a tiny experimental allocation if at all.", color: "bg-rose-100 text-rose-700" },
];

function InvestmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Investment Explorer</h1>
        <p className="text-sm text-muted-foreground">Plain-English overviews of every major asset class — no jargon, no hype.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ASSETS.map(a => (
          <div key={a.name} className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium">{a.name}</h3>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${a.color}`}>{a.risk}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a.desc}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-sage-600 p-6 text-primary-foreground">
        <p className="text-sm font-medium">A beginner-friendly starting recipe</p>
        <p className="mt-2 text-sm opacity-90">80% broad index ETFs, 15% bonds, 5% optional speculation. Rebalance once a year. That's it.</p>
      </div>
    </div>
  );
}

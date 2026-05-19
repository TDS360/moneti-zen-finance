import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";

export const Route = createFileRoute("/_app/analytics")({ component: AnalyticsPage });

function AnalyticsPage() {
  const [range, setRange] = useState<"week" | "month" | "year" | "all">("month");
  const [txns, setTxns] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("transactions").select("*").order("occurred_at", { ascending: true }).then(({ data }) => setTxns(data ?? []));
  }, []);

  const buckets = aggregate(txns, range);
  const forecast = forecastNext(buckets, 3);
  const data = [...buckets, ...forecast];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">Spending, income, and net worth — with a quiet glimpse at what's next.</p>
        </div>
        <div className="flex gap-1 rounded-full bg-muted p-1">
          {(["week", "month", "year", "all"] as const).map(r => (
            <button key={r} onClick={() => setRange(r)} className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${range === r ? "bg-card shadow-sm" : "text-muted-foreground"}`}>{r}</button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="mb-3 text-sm font-medium">Net flow {forecast.length > 0 && <span className="text-xs text-muted-foreground">(dashed = forecast)</span>}</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--sage-600)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--sage-600)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" fontSize={11} stroke="var(--muted-foreground)" />
              <YAxis fontSize={11} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
              <Area dataKey="net" stroke="var(--sage-600)" fill="url(#ag)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="mb-3 text-sm font-medium">Income vs expenses</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis fontSize={11} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Bar dataKey="income" fill="var(--sage-500)" radius={[6,6,0,0]} />
                <Bar dataKey="expense" fill="var(--sage-200)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="mb-3 text-sm font-medium">Cumulative savings</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cumulative(buckets)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis fontSize={11} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Area dataKey="cum" stroke="var(--sage-600)" fill="var(--sage-100)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function aggregate(txns: any[], range: string) {
  // monthly buckets last N
  const N = range === "week" ? 7 : range === "month" ? 6 : range === "year" ? 12 : 24;
  const now = new Date();
  const out: any[] = [];
  for (let i = N - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString("en", { month: "short" });
    const inRange = txns.filter(t => {
      const td = new Date(t.occurred_at);
      return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
    });
    const income = inRange.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const expense = inRange.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
    out.push({ label, income, expense, net: income - expense });
  }
  return out;
}

function cumulative(b: any[]) {
  let c = 0;
  return b.map(x => { c += x.net; return { ...x, cum: c }; });
}

function forecastNext(b: any[], n: number) {
  if (b.length < 2) return [];
  const avg = b.reduce((s, x) => s + x.net, 0) / b.length;
  const out: any[] = [];
  const now = new Date();
  for (let i = 1; i <= n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    out.push({ label: d.toLocaleString("en", { month: "short" }) + "*", income: 0, expense: 0, net: Math.round(avg) });
  }
  return out;
}

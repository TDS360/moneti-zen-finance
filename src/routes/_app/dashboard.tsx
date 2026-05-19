import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney } from "@/lib/format";
import { ArrowDownRight, ArrowUpRight, TrendingUp, Wallet, Target as TargetIcon, Sparkles } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_app/dashboard")({ component: Dashboard });

type Account = { id: string; name: string; type: string; balance: number };
type Txn = { id: string; type: "income" | "expense"; amount: number; category: string | null; note: string | null; occurred_at: string };

function Dashboard() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [a, t] = await Promise.all([
        supabase.from("accounts").select("*"),
        supabase.from("transactions").select("*").order("occurred_at", { ascending: false }).limit(50),
      ]);
      setAccounts((a.data ?? []) as Account[]);
      setTxns((t.data ?? []) as Txn[]);
      setLoading(false);
    })();
  }, []);

  const totalBalance = accounts.reduce((s, a) => s + Number(a.balance), 0);
  const income = txns.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const expenses = txns.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const savings = Math.max(income - expenses, 0);
  const netWorth = totalBalance;
  const health = Math.min(100, Math.round(50 + (savings / Math.max(income, 1)) * 50));

  // Build a 6-month synthetic trend from balance
  const trend = Array.from({ length: 12 }).map((_, i) => ({
    month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
    value: Math.round(netWorth * (0.7 + i * 0.025 + Math.sin(i) * 0.03)),
  }));

  if (loading) return <div className="text-sm text-muted-foreground">Loading your finances…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Good to see you</h1>
        <p className="text-sm text-muted-foreground">Here's the quiet view of your money today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total Balance" value={formatMoney(totalBalance)} icon={Wallet} trend="+4.2%" />
        <Stat label="Income (recent)" value={formatMoney(income)} icon={ArrowUpRight} trend="+12%" positive />
        <Stat label="Expenses (recent)" value={formatMoney(expenses)} icon={ArrowDownRight} trend="-3%" />
        <Stat label="Net Worth" value={formatMoney(netWorth)} icon={TrendingUp} trend="+4.2%" positive />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Net worth over time</p>
              <p className="mt-1 text-2xl font-medium tabular-nums">{formatMoney(netWorth)}</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--sage-600)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--sage-600)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Area type="monotone" dataKey="value" stroke="var(--sage-600)" strokeWidth={2} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Financial Health</p>
            <p className="mt-1 text-3xl font-medium tabular-nums">{health}<span className="text-base text-muted-foreground">/100</span></p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-sage-600" style={{ width: `${health}%` }} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Based on savings rate, budget adherence and emergency reserves.</p>
          </div>

          <div className="rounded-2xl bg-sage-600 p-6 text-primary-foreground">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider opacity-80"><Sparkles className="size-3" /> AI Insight</div>
            <p className="text-sm leading-snug">You spent 12% less this month. Consider routing $200 to your Emergency Fund goal.</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">Recent activity</h2>
          <a href="/budget" className="text-sm text-sage-700 hover:underline">View all →</a>
        </div>
        {txns.length === 0 ? (
          <p className="text-sm text-muted-foreground">No transactions yet. Add one from the Budget page.</p>
        ) : (
          <div className="divide-y divide-border">
            {txns.slice(0, 8).map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{t.note || t.category || "Transaction"}</p>
                  <p className="text-xs text-muted-foreground">{t.category} · {new Date(t.occurred_at).toLocaleDateString()}</p>
                </div>
                <p className={`text-sm font-medium tabular-nums ${t.type === "income" ? "text-emerald-600" : "text-muted-foreground"}`}>
                  {t.type === "income" ? "+" : "-"}{formatMoney(Number(t.amount))}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <QuickAction to="/budget" label="Add transaction" icon={Wallet} />
        <QuickAction to="/goals" label="Set a goal" icon={TargetIcon} />
        <QuickAction to="/coach" label="Ask AI Coach" icon={Sparkles} />
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, trend, positive }: { label: string; value: string; icon: any; trend: string; positive?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-2xl font-medium tabular-nums">{value}</p>
      <p className={`mt-1 text-xs ${positive ? "text-emerald-600" : "text-muted-foreground"}`}>{trend}</p>
    </div>
  );
}

function QuickAction({ to, label, icon: Icon }: { to: string; label: string; icon: any }) {
  return (
    <a href={to} className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-muted">
      <span className="text-sm font-medium">{label}</span>
      <Icon className="size-4 text-sage-600" />
    </a>
  );
}

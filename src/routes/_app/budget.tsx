import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney } from "@/lib/format";
import { Plus, Search, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/budget")({ component: BudgetPage });

type Txn = { id: string; type: "income" | "expense"; amount: number; category: string | null; note: string | null; occurred_at: string };
type Category = { id: string; name: string; color: string; monthly_limit: number | null };

function BudgetPage() {
  const [txns, setTxns] = useState<Txn[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  async function load() {
    const [t, c] = await Promise.all([
      supabase.from("transactions").select("*").order("occurred_at", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
    ]);
    setTxns((t.data ?? []) as Txn[]);
    setCats((c.data ?? []) as Category[]);
  }
  useEffect(() => { load(); }, []);

  const filtered = txns.filter(t =>
    !q || (t.note ?? "").toLowerCase().includes(q.toLowerCase()) || (t.category ?? "").toLowerCase().includes(q.toLowerCase())
  );

  function exportCsv() {
    const rows = [["date", "type", "category", "amount", "note"], ...filtered.map(t => [t.occurred_at, t.type, t.category ?? "", t.amount, t.note ?? ""])];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "moneti-transactions.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Budget</h1>
          <p className="text-sm text-muted-foreground">Track income and expenses across your categories.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm hover:bg-muted"><Download className="size-4" /> Export</button>
          <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-full bg-sage-600 px-4 py-2 text-sm font-medium text-primary-foreground"><Plus className="size-4" /> New</button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cats.filter(c => c.monthly_limit).slice(0, 4).map((c) => {
          const spent = txns.filter(t => t.type === "expense" && t.category === c.name).reduce((s, t) => s + Number(t.amount), 0);
          const pct = Math.min(100, (spent / Number(c.monthly_limit)) * 100);
          return (
            <div key={c.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{c.name}</span>
                <span className="text-xs tabular-nums text-muted-foreground">{formatMoney(spent)} / {formatMoney(Number(c.monthly_limit))}</span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c.color }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <Search className="size-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search transactions…" className="w-full bg-transparent text-sm outline-none" />
        </div>
        <div className="divide-y divide-border">
          {filtered.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No transactions yet. Add your first one.</p>
          ) : filtered.map(t => (
            <div key={t.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">{t.note || t.category}</p>
                <p className="text-xs text-muted-foreground">{t.category} · {new Date(t.occurred_at).toLocaleDateString()}</p>
              </div>
              <p className={`text-sm font-medium tabular-nums ${t.type === "income" ? "text-emerald-600" : "text-foreground"}`}>
                {t.type === "income" ? "+" : "-"}{formatMoney(Number(t.amount))}
              </p>
            </div>
          ))}
        </div>
      </div>

      {open && <NewTxnModal cats={cats} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); load(); }} />}
    </div>
  );
}

function NewTxnModal({ cats, onClose, onSaved }: { cats: Category[]; onClose: () => void; onSaved: () => void }) {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(cats[0]?.name ?? "");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("transactions").insert({
      user_id: u.user.id, type, amount: Number(amount), category, note,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Transaction added");
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="w-full max-w-md space-y-3 rounded-2xl bg-card p-6">
        <h2 className="text-lg font-medium">New transaction</h2>
        <div className="flex gap-2">
          {(["expense", "income"] as const).map(t => (
            <button type="button" key={t} onClick={() => setType(t)} className={`flex-1 rounded-full px-3 py-1.5 text-sm capitalize ${type === t ? "bg-sage-600 text-primary-foreground" : "bg-muted"}`}>{t}</button>
          ))}
        </div>
        <input type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none" />
        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm">
          {cats.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="Note (optional)" className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none" />
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-full border border-border px-4 py-2 text-sm">Cancel</button>
          <button disabled={busy} className="flex-1 rounded-full bg-sage-600 px-4 py-2 text-sm font-medium text-primary-foreground">{busy ? "Saving…" : "Save"}</button>
        </div>
      </form>
    </div>
  );
}

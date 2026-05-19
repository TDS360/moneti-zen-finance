import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney } from "@/lib/format";
import { Plus, Bell } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/bills")({ component: BillsPage });

type Bill = { id: string; name: string; amount: number; frequency: string; next_due: string; category: string | null; reminders_enabled: boolean };

function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [open, setOpen] = useState(false);
  async function load() {
    const { data } = await supabase.from("recurring_bills").select("*").order("next_due");
    setBills((data ?? []) as Bill[]);
  }
  useEffect(() => { load(); }, []);

  const monthly = bills.reduce((s, b) => s + Number(b.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Recurring Bills</h1>
          <p className="text-sm text-muted-foreground">Track subscriptions and bills. Estimated monthly: <span className="tabular-nums">{formatMoney(monthly)}</span></p>
        </div>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-full bg-sage-600 px-4 py-2 text-sm font-medium text-primary-foreground"><Plus className="size-4" /> Add bill</button>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        {bills.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No bills tracked yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {bills.map(b => {
              const due = new Date(b.next_due);
              const days = Math.ceil((due.getTime() - Date.now()) / 86400000);
              return (
                <div key={b.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium">{b.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{b.frequency} · due {due.toLocaleDateString()} ({days}d)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {b.reminders_enabled && <Bell className="size-4 text-sage-600" />}
                    <p className="text-sm font-medium tabular-nums">{formatMoney(Number(b.amount))}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {open && <NewBill onClose={() => setOpen(false)} onSaved={() => { setOpen(false); load(); }} />}
    </div>
  );
}

function NewBill({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [nextDue, setNextDue] = useState(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));

  async function submit(e: FormEvent) {
    e.preventDefault();
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("recurring_bills").insert({
      user_id: u.user!.id, name, amount: Number(amount), frequency, next_due: nextDue,
    });
    if (error) return toast.error(error.message);
    toast.success("Bill added"); onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <form onClick={e => e.stopPropagation()} onSubmit={submit} className="w-full max-w-md space-y-3 rounded-2xl bg-card p-6">
        <h2 className="text-lg font-medium">New recurring bill</h2>
        <input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Netflix" className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none" />
        <input required type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none" />
        <select value={frequency} onChange={e => setFrequency(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm">
          <option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option>
        </select>
        <input required type="date" value={nextDue} onChange={e => setNextDue(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none" />
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-full border border-border px-4 py-2 text-sm">Cancel</button>
          <button className="flex-1 rounded-full bg-sage-600 px-4 py-2 text-sm font-medium text-primary-foreground">Save</button>
        </div>
      </form>
    </div>
  );
}

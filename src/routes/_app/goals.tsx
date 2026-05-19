import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney } from "@/lib/format";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/goals")({ component: GoalsPage });

type Goal = { id: string; name: string; target_amount: number; current_amount: number; deadline: string | null };

function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [open, setOpen] = useState(false);
  async function load() {
    const { data } = await supabase.from("goals").select("*").order("created_at", { ascending: false });
    setGoals((data ?? []) as Goal[]);
  }
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Goals</h1>
          <p className="text-sm text-muted-foreground">Save with intention — track every milestone.</p>
        </div>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-full bg-sage-600 px-4 py-2 text-sm font-medium text-primary-foreground"><Plus className="size-4" /> New goal</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goals.length === 0 && <p className="text-sm text-muted-foreground">No goals yet. Set your first one.</p>}
        {goals.map(g => {
          const pct = Math.min(100, (Number(g.current_amount) / Number(g.target_amount)) * 100);
          return (
            <div key={g.id} className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm font-medium">{g.name}</p>
              <p className="mt-1 text-2xl font-medium tabular-nums">{formatMoney(Number(g.current_amount))} <span className="text-sm text-muted-foreground">/ {formatMoney(Number(g.target_amount))}</span></p>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-sage-600" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{pct.toFixed(0)}% complete{g.deadline ? ` · by ${new Date(g.deadline).toLocaleDateString()}` : ""}</p>
            </div>
          );
        })}
      </div>

      {open && <NewGoal onClose={() => setOpen(false)} onSaved={() => { setOpen(false); load(); }} />}
    </div>
  );
}

function NewGoal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("0");
  const [deadline, setDeadline] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("goals").insert({
      user_id: u.user!.id, name, target_amount: Number(target), current_amount: Number(current),
      deadline: deadline || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Goal created"); onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <form onClick={e => e.stopPropagation()} onSubmit={submit} className="w-full max-w-md space-y-3 rounded-2xl bg-card p-6">
        <h2 className="text-lg font-medium">New goal</h2>
        <input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Kyoto Trip" className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none" />
        <input required type="number" step="0.01" value={target} onChange={e => setTarget(e.target.value)} placeholder="Target amount" className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none" />
        <input type="number" step="0.01" value={current} onChange={e => setCurrent(e.target.value)} placeholder="Currently saved" className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none" />
        <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none" />
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-full border border-border px-4 py-2 text-sm">Cancel</button>
          <button className="flex-1 rounded-full bg-sage-600 px-4 py-2 text-sm font-medium text-primary-foreground">Save</button>
        </div>
      </form>
    </div>
  );
}

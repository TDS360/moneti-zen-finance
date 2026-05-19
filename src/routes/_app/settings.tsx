import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useTheme } from "next-themes";

export const Route = createFileRoute("/_app/settings")({ component: SettingsPage });

function SettingsPage() {
  const { user, signOut } = useAuth();
  const [fullName, setFullName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    supabase.from("profiles").select("*").eq("id", user!.id).single().then(({ data }) => {
      if (data) { setFullName(data.full_name ?? ""); setCurrency(data.currency); setDark(data.theme === "dark"); document.documentElement.classList.toggle("dark", data.theme === "dark"); }
    });
  }, [user]);

  async function save() {
    const { error } = await supabase.from("profiles").update({ full_name: fullName, currency, theme: dark ? "dark" : "light" }).eq("id", user!.id);
    if (error) return toast.error(error.message);
    document.documentElement.classList.toggle("dark", dark);
    toast.success("Saved");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account, preferences and privacy.</p>
      </div>

      <Section title="Account">
        <Field label="Full name"><input value={fullName} onChange={e => setFullName(e.target.value)} className="input" /></Field>
        <Field label="Email"><input disabled value={user?.email ?? ""} className="input opacity-60" /></Field>
        <Field label="Currency">
          <select value={currency} onChange={e => setCurrency(e.target.value)} className="input">
            <option>USD</option><option>EUR</option><option>GBP</option><option>JPY</option>
          </select>
        </Field>
      </Section>

      <Section title="Appearance">
        <label className="flex items-center justify-between">
          <span className="text-sm">Dark mode</span>
          <input type="checkbox" checked={dark} onChange={e => setDark(e.target.checked)} className="size-4 accent-sage-600" />
        </label>
      </Section>

      <Section title="Privacy">
        <p className="text-sm text-muted-foreground">Your data is encrypted at rest and never sold. You can request export or deletion at any time.</p>
      </Section>

      <div className="flex gap-3">
        <button onClick={save} className="rounded-full bg-sage-600 px-5 py-2 text-sm font-medium text-primary-foreground">Save changes</button>
        <button onClick={signOut} className="rounded-full border border-border px-5 py-2 text-sm font-medium">Log out</button>
      </div>

      <style>{`.input { width: 100%; border-radius: 0.75rem; border: 1px solid var(--border); background: var(--card); padding: 0.625rem 0.875rem; font-size: 0.875rem; outline: none; }`}</style>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="mb-4 text-sm font-medium">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>{children}</label>;
}

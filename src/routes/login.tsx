import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — Moneti" }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    nav({ to: "/dashboard" });
  }

  async function google() {
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (res.error) toast.error("Google sign-in failed");
  }

  return <AuthShell title="Welcome back" sub="Sign in to your Moneti account">
    <button type="button" onClick={google} className="mb-4 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-muted">
      <GoogleIcon /> Continue with Google
    </button>
    <Divider />
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input label="Email" type="email" required value={email} onChange={setEmail} placeholder="you@email.com" />
      <Input label="Password" type="password" required value={password} onChange={setPassword} placeholder="••••••••" />
      <button disabled={loading} className="w-full rounded-full bg-sage-600 px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">{loading ? "Signing in…" : "Sign in"}</button>
    </form>
    <p className="mt-6 text-center text-sm text-muted-foreground">
      New to Moneti? <Link to="/signup" className="font-medium text-sage-700 hover:underline">Create an account</Link>
    </p>
  </AuthShell>;
}

export function AuthShell({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-sage-600 p-12 lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="text-lg font-semibold text-primary-foreground">Moneti</Link>
        <div>
          <p className="font-serif text-4xl leading-snug text-primary-foreground" style={{ fontFamily: "Instrument Serif, serif" }}>
            "A calm, intelligent space for the financial life I want to lead."
          </p>
          <p className="mt-6 text-sm text-primary-foreground/70">— Sarah J., founder</p>
        </div>
        <p className="text-xs uppercase tracking-widest text-primary-foreground/50">Private. Encrypted. Beautifully simple.</p>
      </div>
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 inline-block text-lg font-semibold text-sage-700 lg:hidden">Moneti</Link>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function Input({ label, value, onChange, ...rest }: { label: string; value: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none ring-sage-600/20 focus:ring-2"
        {...rest}
      />
    </label>
  );
}

export function Divider() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
      <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
    </div>
  );
}

export function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 5.1 29.3 3 24 3 16.3 3 9.7 7.5 6.3 14.7z"/><path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.6 5.1C9.5 40.4 16.2 45 24 45z"/><path fill="#1976D2" d="M43.6 20.5H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2c4.3-4 7-9.9 7-17.3 0-.5 0-1-.1-1.5z"/></svg>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { AuthShell, Divider, GoogleIcon, Input } from "./login";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — Moneti" }] }),
  component: SignupPage,
});

function SignupPage() {
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin + "/dashboard" },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome to Moneti");
    nav({ to: "/dashboard" });
  }

  async function google() {
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (res.error) toast.error("Google sign-up failed");
  }

  return <AuthShell title="Begin your clarity phase" sub="Create your free Moneti account in seconds">
    <button type="button" onClick={google} className="mb-4 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-muted">
      <GoogleIcon /> Continue with Google
    </button>
    <Divider />
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input label="Full name" required value={fullName} onChange={setFullName} placeholder="Sarah Jenkins" />
      <Input label="Email" type="email" required value={email} onChange={setEmail} placeholder="you@email.com" />
      <Input label="Password" type="password" required value={password} onChange={setPassword} placeholder="At least 8 characters" />
      <button disabled={loading} className="w-full rounded-full bg-sage-600 px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">{loading ? "Creating account…" : "Create account"}</button>
    </form>
    <p className="mt-6 text-center text-sm text-muted-foreground">
      Already have one? <Link to="/login" className="font-medium text-sage-700 hover:underline">Log in</Link>
    </p>
  </AuthShell>;
}

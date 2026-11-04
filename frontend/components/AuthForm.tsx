"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { api, apiError } from "@/lib/api";
import { saveSession } from "@/lib/auth";
import { Button, Input, Logo } from "@/components/ui";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response =
        mode === "login"
          ? await api.post("/api/auth/login", { email, password })
          : await api.post("/api/auth/register", { name, email, password });
      saveSession(response.data.token, response.data.user);
      router.push("/dashboard");
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="grain flex min-h-screen items-center justify-center px-6 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[#dfe8e1] bg-white shadow-soft lg:grid-cols-[.85fr_1.15fr]">
        <div className="relative hidden overflow-hidden bg-ink p-10 text-white lg:block">
          <div className="absolute -right-24 -top-16 h-72 w-72 rounded-full border border-sage/20" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full border border-coral/30" />
          <Logo light />
          <div className="relative mt-28 max-w-sm">
            <p className="text-sm font-bold uppercase tracking-[.18em] text-coral">
              A calmer way forward
            </p>
            <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-[-.05em]">
              Make your work{" "}
              <span className="text-sage">impossible to miss.</span>
            </h1>
            <p className="mt-6 leading-7 text-sage">
              Build a career story that feels like you — clear, considered, and
              ready for the next orbit.
            </p>
          </div>
          <div className="absolute bottom-10 left-10 right-10 flex items-center justify-between border-t border-white/10 pt-5 text-xs text-sage">
            <span>Resumes · Portfolios · Momentum</span>
            <span>01 / 05</span>
          </div>
        </div>
        <div className="p-7 sm:p-12">
          <div className="flex items-center justify-between lg:hidden">
            <Logo />
            <Link href="/" className="text-sm text-slate-500">
              Back home
            </Link>
          </div>
          <div className="mx-auto max-w-md">
            <div className="mt-12 lg:mt-8">
              <p className="text-sm font-bold uppercase tracking-[.16em] text-coral">
                {mode === "login" ? "Welcome back" : "Begin your orbit"}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-.04em]">
                {mode === "login"
                  ? "Sign in to your workspace."
                  : "Create your Orbit account."}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {mode === "login"
                  ? "Pick up where you left off and keep your story moving."
                  : "Your first polished resume is a few thoughtful steps away."}
              </p>
            </div>
            <form onSubmit={submit} className="mt-8 space-y-5">
              {mode === "register" && (
                <Input
                  label="Full name"
                  placeholder="Aarav Mehta"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              )}
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              <Button type="submit" loading={loading} className="w-full py-3">
                {mode === "login" ? "Enter workspace" : "Create account"}
                <ArrowRight size={16} />
              </Button>
            </form>
            <div className="mt-7 flex items-start gap-3 rounded-xl bg-[#f7faf7] p-4 text-xs leading-5 text-slate-500">
              <ShieldCheck size={18} className="shrink-0 text-moss" />
              <span>
                Your account protects your career assets. We never store
                passwords in plain text.
              </span>
            </div>
            <p className="mt-8 text-center text-sm text-slate-500">
              {mode === "login"
                ? "New to Orbit? "
                : "Already have an account? "}
              <Link
                className="font-bold text-moss hover:underline"
                href={mode === "login" ? "/register" : "/login"}
              >
                {mode === "login" ? "Create one" : "Sign in"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

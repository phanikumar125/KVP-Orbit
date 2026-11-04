"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Loader2,
  Sparkles,
} from "lucide-react";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2.5 font-semibold tracking-tight ${light ? "text-white" : "text-ink"}`}
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-coral text-white shadow-sm">
        <Sparkles size={17} strokeWidth={2.3} />
      </span>
      <span className="text-[17px]">
        KVP <span className={light ? "text-sage" : "text-moss"}>Orbit</span>
      </span>
    </Link>
  );
}

export function Button({
  children,
  variant = "primary",
  loading,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
}) {
  const styles = {
    primary: "bg-ink text-white hover:bg-moss",
    secondary:
      "bg-white text-ink border border-[#d8e2da] hover:border-moss hover:text-moss",
    ghost: "text-moss hover:bg-sage/60",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
  };
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  );
}

export function Input({
  label,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  return (
    <label className="block space-y-1.5 text-sm font-medium text-ink">
      {label && <span>{label}</span>}
      <input
        {...props}
        className={`w-full rounded-xl border bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-moss focus:ring-4 focus:ring-sage/60 ${error ? "border-red-400" : "border-[#d8e2da]"}`}
      />
      {error && (
        <span className="text-xs font-normal text-red-600">{error}</span>
      )}
    </label>
  );
}

export function TextArea({
  label,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block space-y-1.5 text-sm font-medium text-ink">
      {label && <span>{label}</span>}
      <textarea
        {...props}
        className="min-h-[112px] w-full resize-y rounded-xl border border-[#d8e2da] bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-moss focus:ring-4 focus:ring-sage/60"
      />
    </label>
  );
}

export function Select({
  label,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-sm font-medium text-ink">
      {label && <span>{label}</span>}
      <span className="relative block">
        <select
          {...props}
          className="w-full appearance-none rounded-xl border border-[#d8e2da] bg-white px-3.5 py-3 text-sm outline-none focus:border-moss focus:ring-4 focus:ring-sage/60"
        >
          {children}
        </select>
        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-3.5 text-slate-400"
        />
      </span>
    </label>
  );
}

export function Card({
  children,
  className = "",
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-[#dfe8e1] bg-white ${hover ? "transition hover:-translate-y-1 hover:border-[#b2c9b9] hover:shadow-card" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "sage",
}: {
  children: ReactNode;
  tone?: "sage" | "coral" | "ink";
}) {
  const styles = {
    sage: "bg-sage text-moss",
    coral: "bg-[#fff0e9] text-[#b55b43]",
    ink: "bg-ink text-white",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[.12em] ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

export function Progress({ value }: { value: number }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-sage">
      <div
        className="h-full rounded-full bg-moss transition-all duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function CheckItem({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-600">
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-sage text-moss">
        <Check size={12} strokeWidth={3} />
      </span>
      {children}
    </div>
  );
}

export function ArrowLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 text-sm font-bold text-moss"
    >
      {children}
      <ArrowRight size={15} className="transition group-hover:translate-x-1" />
    </Link>
  );
}

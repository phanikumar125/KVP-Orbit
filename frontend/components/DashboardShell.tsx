"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpenCheck,
  BriefcaseBusiness,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Sparkles,
  ScanSearch,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { clearSession, getStoredUser } from "@/lib/auth";
import { Logo } from "@/components/ui";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/resumes", label: "My resumes", icon: FileText },
  { href: "/dashboard/portfolio", label: "Portfolio", icon: BookOpenCheck },
  { href: "/dashboard/assessments", label: "Assessments", icon: Sparkles },
  { href: "/dashboard/ats", label: "ATS match", icon: ScanSearch },
  { href: "/dashboard/placement", label: "Placement", icon: BriefcaseBusiness },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const user = getStoredUser();
  useEffect(() => {
    if (!window.localStorage.getItem("kvp_token")) router.replace("/login");
  }, [router]);
  const signOut = () => {
    clearSession();
    router.push("/");
  };
  return (
    <div className="min-h-screen bg-cream">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-[#dfe8e1] bg-white px-5 py-6 transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between">
          <Logo />
          <button
            className="text-slate-400 lg:hidden"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="mt-12 rounded-2xl bg-ink p-5 text-white">
          <p className="text-xs font-bold uppercase tracking-[.15em] text-sage">
            Your orbit
          </p>
          <p className="mt-3 text-lg font-semibold">
            Small steps. Real momentum.
          </p>
          <div className="mt-5 h-1.5 rounded-full bg-white/15">
            <div className="h-full w-[35%] rounded-full bg-coral" />
          </div>
          <p className="mt-2 text-xs text-sage">1 of 3 starter milestones</p>
        </div>
        <nav className="mt-9 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${pathname === href || (href !== "/dashboard" && pathname.startsWith(href)) ? "bg-sage text-moss" : "text-slate-500 hover:bg-[#f3f7f3] hover:text-ink"}`}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-6 left-5 right-5">
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#e6eee7] p-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-sage text-sm font-bold text-moss">
              {user?.name?.slice(0, 1).toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">
                {user?.name || "Your workspace"}
              </p>
              <p className="truncate text-xs text-slate-500">
                {user?.email || ""}
              </p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#dfe8e1] bg-cream/90 px-5 backdrop-blur lg:px-10">
          <button
            className="rounded-xl border border-[#dfe8e1] bg-white p-2 text-slate-500 lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="hidden text-sm text-slate-500 sm:block">
            Workspace <span className="mx-2 text-slate-300">/</span>{" "}
            <span className="font-semibold text-ink">
              {pathname.includes("resumes") ? "Resume builder" : "Overview"}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/dashboard/resumes/new"
              className="hidden rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-moss sm:block"
            >
              + New resume
            </Link>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-coral text-sm font-bold text-white">
              {user?.name?.slice(0, 1).toUpperCase() || "U"}
            </div>
          </div>
        </header>
        <main className="px-5 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  FileText,
  Plus,
  Sparkles,
  Target,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { Badge, Button, Card } from "@/components/ui";
import type { Resume } from "@/lib/types";

export default function DashboardPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const user = getStoredUser();
  useEffect(() => {
    api
      .get("/api/resumes")
      .then((response) => setResumes(response.data))
      .catch(() => undefined);
  }, []);
  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <Badge>Wednesday, 19 August</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-.05em]">
            Good morning,{" "}
            <span className="text-moss">
              {user?.name?.split(" ")[0] || "there"}.
            </span>
          </h1>
          <p className="mt-2 text-slate-500">
            Let&apos;s keep your career story moving forward.
          </p>
        </div>
        <Link href="/dashboard/resumes/new">
          <Button>
            <Plus size={16} />
            Create a resume
          </Button>
        </Link>
      </div>
      <div className="mt-9 grid gap-4 md:grid-cols-3">
        <Stat
          icon={<FileText />}
          label="Resumes created"
          value={String(resumes.length)}
          helper={
            resumes.length
              ? "Keep refining your story"
              : "Your first one is waiting"
          }
        />
        <Stat
          icon={<Target />}
          label="Profile readiness"
          value={resumes.length ? "35%" : "0%"}
          helper="Complete a resume to unlock"
        />
        <Stat
          icon={<BarChart3 />}
          label="Career momentum"
          value="Early orbit"
          helper="A little progress compounds"
        />
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <Card className="overflow-hidden">
          <div className="flex items-start justify-between border-b border-[#e7eee8] p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-coral">
                Your workspace
              </p>
              <h2 className="mt-2 text-xl font-semibold">Recent resumes</h2>
            </div>
            <Link
              href="/dashboard/resumes"
              className="text-sm font-bold text-moss"
            >
              View all <ArrowRight className="ml-1 inline" size={14} />
            </Link>
          </div>
          {resumes.length ? (
            <div className="divide-y divide-[#e7eee8]">
              {resumes.slice(0, 3).map((resume) => (
                <Link
                  key={resume.id}
                  href={`/dashboard/resumes/${resume.id}`}
                  className="flex items-center justify-between gap-4 p-5 transition hover:bg-[#fbfcfa]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sage text-moss">
                      <FileText size={17} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">
                        {resume.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {resume.personal_info?.professionalTitle ||
                          "Untitled profile"}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">
                    {resume.updated_at
                      ? new Date(resume.updated_at).toLocaleDateString()
                      : "Recently"}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-sage text-moss">
                <FileText size={22} />
              </span>
              <p className="mt-4 font-semibold">
                Your first resume starts here.
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Build it once, then keep it ready for every next step.
              </p>
              <Link
                href="/dashboard/resumes/new"
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-moss"
              >
                Start building <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </Card>
        <Card className="bg-ink p-7 text-white">
          <div className="flex items-center justify-between">
            <Badge tone="coral">Starter path</Badge>
            <Sparkles size={18} className="text-coral" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold tracking-[-.03em]">
            The orbit checklist
          </h2>
          <div className="mt-6 space-y-4">
            <CheckRow
              done={resumes.length > 0}
              text="Create your first resume"
            />
            <CheckRow done={false} text="Add three projects or experiences" />
            <CheckRow done={false} text="Export a role-ready PDF" />
          </div>
          <div className="mt-7 border-t border-white/10 pt-5">
            <p className="text-xs leading-5 text-sage">
              Progress is not a personality trait. It&apos;s just one clear next
              step.
            </p>
          </div>
        </Card>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <MiniModule
          icon={<Clock3 />}
          title="Portfolio builder"
          text="Turn selected work into a public story."
        />
        <MiniModule
          icon={<Sparkles />}
          title="Assessments"
          text="Find your strongest signals and gaps."
        />
        <MiniModule
          icon={<Target />}
          title="ATS optimizer"
          text="Tune your resume for the role ahead."
        />
      </div>
    </div>
  );
}
function Stat({
  icon,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <Card className="p-5">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-sage text-moss">
        {icon}
      </span>
      <p className="mt-5 text-xs font-bold uppercase tracking-[.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </Card>
  );
}
function CheckRow({ done, text }: { done: boolean; text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <CheckCircle2
        size={18}
        className={done ? "text-coral" : "text-white/20"}
      />
      <span className={done ? "text-white" : "text-sage"}>{text}</span>
    </div>
  );
}
function MiniModule({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Card className="flex items-start gap-4 p-5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fff0e9] text-coral">
        {icon}
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm leading-5 text-slate-500">{text}</p>
        <span className="mt-3 inline-block text-[10px] font-bold uppercase tracking-[.14em] text-coral">
          Coming soon
        </span>
      </div>
    </Card>
  );
}

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";

export function ComingSoon({ kind }: { kind: "portfolio" | "assessments" }) {
  const portfolio = kind === "portfolio";
  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-bold text-moss"
      >
        <ArrowLeft size={15} />
        Back to overview
      </Link>
      <div className="mt-12 max-w-2xl">
        <Badge tone="coral">Coming next</Badge>
        <h1 className="mt-5 text-5xl font-semibold tracking-[-.05em]">
          Your {portfolio ? "portfolio" : "assessment"} orbit is{" "}
          <span className="text-moss">forming.</span>
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          This module is part of the KVP Orbit roadmap. The resume studio is
          ready now, and the foundation underneath is designed for this next
          layer.
        </p>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <Card className="bg-ink p-7 text-white">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-coral">
            {portfolio ? <BookOpenCheck /> : <Target />}
          </span>
          <h2 className="mt-7 text-2xl font-semibold">
            {portfolio ? "Portfolio builder" : "Assessment engine"}
          </h2>
          <p className="mt-3 leading-7 text-sage">
            {portfolio
              ? "Showcase your best work with a public profile, project stories, skills, and a theme that feels like you."
              : "Build confidence with technical questions, timed practice, attempt history, and progress signals."}
          </p>
        </Card>
        <Card className="p-7">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sage text-moss">
            <Sparkles />
          </span>
          <h2 className="mt-7 text-2xl font-semibold">What you can do today</h2>
          <p className="mt-3 leading-7 text-slate-500">
            Create a strong resume first. It will become the source material for
            every future career asset in Orbit.
          </p>
          <Link
            href="/dashboard/resumes/new"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-bold text-white hover:bg-moss"
          >
            Build a resume <ArrowRight size={15} />
          </Link>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ResumeBuilder } from "@/components/ResumeBuilder";
import { api, apiError } from "@/lib/api";
import type { Resume } from "@/lib/types";

export default function EditResumePage() { const params = useParams<{ id: string }>(); const [resume, setResume] = useState<Resume | null>(null); const [error, setError] = useState(""); useEffect(() => { api.get(`/api/resumes/${params.id}`).then((response) => setResume(response.data)).catch((e) => setError(apiError(e, "Could not load that resume."))); }, [params.id]); if (error) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">{error}</div>; if (!resume) return <div className="h-64 animate-pulse rounded-2xl bg-sage/60" />; return <ResumeBuilder initial={resume} resumeId={Number(params.id)} />; }


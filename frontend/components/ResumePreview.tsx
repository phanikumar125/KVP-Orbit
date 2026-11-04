"use client";

import { Globe, Mail, MapPin, Phone } from "lucide-react";
import { API_URL } from "@/lib/api";
import type { Resume, TemplateName } from "@/lib/types";

const safe = (value: unknown) => (typeof value === "string" ? value : "");

export function ResumePreview({
  resume,
  className = "",
}: {
  resume: Resume;
  className?: string;
}) {
  const p = resume.personal_info;
  const template = resume.template;
  const accent: Record<TemplateName, string> = {
    classic: "#486656",
    modern: "#d76d51",
    professional: "#1d4e5f",
    minimal: "#282d2a",
    creative: "#8e5a75",
  };
  const color = accent[template];
  const heading = template === "creative" ? "font-serif" : "";
  return (
    <article
      id="resume-preview"
      className={`resume-paper min-h-[1050px] w-full max-w-[800px] overflow-hidden p-9 sm:p-12 ${template === "modern" ? "rounded-[2px]" : ""} ${className}`}
      style={{
        fontFamily:
          template === "creative" ? "Georgia, serif" : "Arial, sans-serif",
      }}
    >
      <header
        className={`${template === "modern" ? "border-b-4 pb-7" : template === "professional" ? "border-l-4 pl-5 pb-5" : template === "minimal" ? "pb-10" : "border-b pb-6"}`}
        style={{ borderColor: color }}
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <h1
              className={`text-3xl font-bold tracking-[-.04em] sm:text-4xl ${heading}`}
            >
              {safe(p.fullName) || "Your full name"}
            </h1>
            <p className="mt-2 text-base font-semibold" style={{ color }}>
              {safe(p.professionalTitle) || "Your professional title"}
            </p>
          </div>
          {p.profileImage ? (
            <img
              src={
                p.profileImage.startsWith("/")
                  ? `${API_URL}${p.profileImage}`
                  : p.profileImage
              }
              alt="Profile"
              className="h-20 w-20 rounded-2xl object-cover"
            />
          ) : (
            <div
              className="grid h-16 w-16 place-items-center rounded-xl text-xs font-bold"
              style={{ backgroundColor: `${color}15`, color }}
            >
              PHOTO
            </div>
          )}
        </div>
        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-600">
          {p.email && (
            <span className="flex items-center gap-1">
              <Mail size={12} style={{ color }} />
              {p.email}
            </span>
          )}
          {p.phone && (
            <span className="flex items-center gap-1">
              <Phone size={12} style={{ color }} />
              {p.phone}
            </span>
          )}
          {p.location && (
            <span className="flex items-center gap-1">
              <MapPin size={12} style={{ color }} />
              {p.location}
            </span>
          )}
          {(p.linkedIn || p.github || p.portfolio) && (
            <span className="flex items-center gap-1">
              <Globe size={12} style={{ color }} />
              {p.linkedIn || p.github || p.portfolio}
            </span>
          )}
        </div>
      </header>
      <div className="mt-7 space-y-7 text-[12px] leading-[1.55]">
        {resume.summary && (
          <Section title="Profile" color={color} heading={heading}>
            <p className="text-slate-700">{resume.summary}</p>
          </Section>
        )}
        {resume.experience.length > 0 && (
          <Section title="Experience" color={color} heading={heading}>
            {resume.experience.map((item) => (
              <div key={item.id} className="mb-4 last:mb-0">
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {item.jobTitle || "Role title"}
                    </h3>
                    <p className="font-semibold" style={{ color }}>
                      {item.company || "Company"}
                      {item.employmentType ? ` · ${item.employmentType}` : ""}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {item.startDate || "Start"} —{" "}
                    {item.current ? "Present" : item.endDate || "End"}
                  </span>
                </div>
                {item.description && (
                  <p className="mt-1.5 whitespace-pre-line text-slate-600">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </Section>
        )}
        {resume.education.length > 0 && (
          <Section title="Education" color={color} heading={heading}>
            {resume.education.map((item) => (
              <div
                key={item.id}
                className="mb-3 flex justify-between gap-3 last:mb-0"
              >
                <div>
                  <h3 className="font-bold text-slate-900">
                    {item.degree || "Degree"}
                    {item.field ? `, ${item.field}` : ""}
                  </h3>
                  <p className="text-slate-600">
                    {item.institution || "Institution"}
                    {item.cgpa ? ` · CGPA ${item.cgpa}` : ""}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-slate-500">
                  {item.startYear}
                  {item.endYear ? ` — ${item.endYear}` : ""}
                </span>
              </div>
            ))}
          </Section>
        )}
        {resume.skills.length > 0 && (
          <Section title="Skills" color={color} heading={heading}>
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{ backgroundColor: `${color}12`, color }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </Section>
        )}
        {resume.projects.length > 0 && (
          <Section title="Selected projects" color={color} heading={heading}>
            {resume.projects.map((item) => (
              <div key={item.id} className="mb-3 last:mb-0">
                <h3 className="font-bold text-slate-900">
                  {item.title || "Project title"}
                </h3>
                {item.technologies && (
                  <p className="font-semibold" style={{ color }}>
                    {item.technologies}
                  </p>
                )}
                {item.description && (
                  <p className="mt-1 text-slate-600">{item.description}</p>
                )}
              </div>
            ))}
          </Section>
        )}
        {resume.certifications.length > 0 && (
          <Section title="Certifications" color={color} heading={heading}>
            {resume.certifications.map((item) => (
              <p key={item.id} className="text-slate-700">
                <strong>{item.name}</strong>
                {item.issuer ? ` · ${item.issuer}` : ""}
                {item.year ? ` · ${item.year}` : ""}
              </p>
            ))}
          </Section>
        )}
        {resume.languages.length > 0 && (
          <Section title="Languages" color={color} heading={heading}>
            <div className="flex flex-wrap gap-3">
              {resume.languages.map((item) => (
                <span key={item.id} className="text-slate-700">
                  <strong>{item.name}</strong>
                  {item.level ? ` — ${item.level}` : ""}
                </span>
              ))}
            </div>
          </Section>
        )}
        {!resume.summary &&
          !resume.experience.length &&
          !resume.education.length &&
          !resume.skills.length &&
          !resume.projects.length && (
            <div className="rounded-xl border border-dashed border-sage p-8 text-center text-slate-400">
              Your finished story will appear here as you build.
            </div>
          )}
      </div>
    </article>
  );
}

function Section({
  title,
  color,
  heading,
  children,
}: {
  title: string;
  color: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2
        className={`mb-3 text-[11px] font-bold uppercase tracking-[.2em] ${heading}`}
        style={{ color }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

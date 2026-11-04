"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  ImagePlus,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { api, apiError, API_URL } from "@/lib/api";
import {
  emptyResume,
  templateMeta,
  type Resume,
  type TemplateName,
} from "@/lib/types";
import {
  Badge,
  Button,
  Card,
  Input,
  Progress,
  Select,
  TextArea,
} from "@/components/ui";
import { ResumePreview } from "@/components/ResumePreview";

const steps = [
  "Personal",
  "Education",
  "Experience",
  "Skills",
  "Projects",
  "Preview",
];
type Collection = "education" | "experience" | "projects";
const uid = () => Math.random().toString(36).slice(2, 10);

export function ResumeBuilder({
  initial,
  resumeId,
}: {
  initial?: Resume;
  resumeId?: number;
}) {
  const [savedResumeId, setSavedResumeId] = useState<number | undefined>(resumeId);
  const [resume, setResume] = useState<Resume>(() =>
    normalizeResume(initial || emptyResume),
  );
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const setPersonal = (key: keyof Resume["personal_info"], value: string) =>
    setResume((current) => ({
      ...current,
      personal_info: { ...current.personal_info, [key]: value },
    }));
  const setField = (key: keyof Resume, value: unknown) =>
    setResume((current) => ({ ...current, [key]: value }));
  const patchItem = (
    key: Collection,
    id: string,
    field: string,
    value: unknown,
  ) =>
    setResume((current) => ({
      ...current,
      [key]: (current[key] as Array<Record<string, unknown>>).map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  const removeItem = (key: Collection, id: string) =>
    setResume((current) => ({
      ...current,
      [key]: (current[key] as Array<{ id: string }>).filter(
        (item) => item.id !== id,
      ),
    }));
  const validate = () => {
    if (
      step === 0 &&
      (!resume.personal_info.fullName ||
        !resume.personal_info.email ||
        !resume.personal_info.professionalTitle)
    ) {
      setError(
        "Add your name, professional title, and email before continuing.",
      );
      return false;
    }
    setError("");
    return true;
  };
  const next = () => {
    if (validate())
      setStep((current) => Math.min(steps.length - 1, current + 1));
  };
  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = savedResumeId
        ? await api.put(`/api/resumes/${savedResumeId}`, resume)
        : await api.post("/api/resumes", resume);
      setResume(normalizeResume(response.data));
      setSavedResumeId(response.data.id);
      setMessage(
        savedResumeId
          ? "Resume updated — your latest changes are safe."
          : "Resume saved — your story is now in orbit.",
      );
      if (!savedResumeId && response.data.id)
        window.history.replaceState(
          null,
          "",
          `/dashboard/resumes/${response.data.id}`,
        );
    } catch (e) {
      setError(apiError(e, "Could not save your resume. Is the API running?"));
    } finally {
      setSaving(false);
    }
  };
  const upload = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await api.post("/api/upload/profile", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPersonal("profileImage", response.data.url);
    } catch (e) {
      setError(apiError(e, "Image upload failed."));
    } finally {
      setUploading(false);
    }
  };
  const downloadPdf = async () => {
    const element = document.getElementById("resume-preview");
    if (!element) return;
    setMessage("Preparing your PDF…");
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
    const pdf = new jsPDF("p", "pt", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imageHeight = (canvas.height * width) / canvas.width;
    let remaining = imageHeight;
    let position = 0;
    while (remaining > 0) {
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, width, imageHeight);
      remaining -= pageHeight;
      position -= pageHeight;
      if (remaining > 0) pdf.addPage();
    }
    pdf.save(
      `${(resume.title || "resume").replace(/\s+/g, "-").toLowerCase()}.pdf`,
    );
    setMessage("Your PDF is ready to download.");
  };

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Badge>{resumeId ? "Edit resume" : "New resume"}</Badge>
            <span className="text-xs font-semibold text-slate-400">
              Step {step + 1} of {steps.length}
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-.04em]">
            Shape your next <span className="text-moss">opportunity.</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            A few thoughtful details now. A much clearer story later.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => window.history.back()}>
            <ArrowLeft size={15} />
            Exit
          </Button>
          {step === steps.length - 1 && (
            <Button variant="secondary" onClick={downloadPdf}>
              <Download size={15} />
              Download PDF
            </Button>
          )}
          <Button onClick={save} loading={saving}>
            <Save size={15} />
            {resumeId ? "Update resume" : "Save resume"}
          </Button>
        </div>
      </div>
      <div className="mb-7 max-w-3xl">
        <div className="mb-3 flex justify-between text-xs font-bold uppercase tracking-[.14em] text-slate-400">
          <span>{steps[step]}</span>
          <span>{Math.round((step / (steps.length - 1)) * 100)}%</span>
        </div>
        <Progress value={(step / (steps.length - 1)) * 100} />
      </div>
      {(error || message) && (
        <div
          className={`mb-6 rounded-xl border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-600" : "border-[#cbe1d0] bg-[#eff8f0] text-moss"}`}
        >
          {error || message}
        </div>
      )}
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(420px,.82fr)]">
        <Card className="min-h-[670px] p-6 sm:p-8">
          {step === 0 && (
            <PersonalStep
              resume={resume}
              setPersonal={setPersonal}
              setField={setField}
              upload={upload}
              uploading={uploading}
            />
          )}
          {step === 1 && (
            <EducationStep
              resume={resume}
              setField={setField}
              patchItem={patchItem}
              removeItem={removeItem}
            />
          )}
          {step === 2 && (
            <ExperienceStep
              resume={resume}
              setField={setField}
              patchItem={patchItem}
              removeItem={removeItem}
            />
          )}
          {step === 3 && <SkillsStep resume={resume} setField={setField} />}
          {step === 4 && (
            <ProjectsStep
              resume={resume}
              setField={setField}
              patchItem={patchItem}
              removeItem={removeItem}
            />
          )}
          {step === 5 && <PreviewStep resume={resume} setField={setField} />}
          <div className="mt-10 flex items-center justify-between border-t border-[#e7eee8] pt-5">
            <Button
              variant="ghost"
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              disabled={step === 0}
            >
              <ArrowLeft size={15} />
              Previous
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={next}>
                Next step <ArrowRight size={15} />
              </Button>
            ) : (
              <Button onClick={save} loading={saving}>
                <Save size={15} />
                Finish & save
              </Button>
            )}
          </div>
        </Card>
        <div className="hidden xl:block">
          <div className="sticky top-28">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-ink">Live preview</p>
              <span className="text-xs font-semibold text-slate-400">
                {templateMeta[resume.template].label} template
              </span>
            </div>
            <div className="max-h-[calc(100vh-170px)] overflow-auto rounded-2xl bg-[#e9eee9] p-6">
              <ResumePreview
                resume={resume}
                className="origin-top scale-[.84]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function normalizeResume(input: Resume): Resume {
  return {
    ...emptyResume,
    ...input,
    personal_info: {
      ...emptyResume.personal_info,
      ...(input.personal_info || {}),
    },
    education: input.education || [],
    experience: input.experience || [],
    skills: input.skills || [],
    projects: input.projects || [],
    certifications: input.certifications || [],
    languages: input.languages || [],
  };
}
function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="mb-7">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-coral">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-.03em]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}
function EmptyHint({ text }: { text: string }) {
  return (
    <p className="mt-5 rounded-xl bg-[#f7faf7] px-4 py-3 text-sm text-slate-500">
      {text}
    </p>
  );
}

function PersonalStep({
  resume,
  setPersonal,
  setField,
  upload,
  uploading,
}: {
  resume: Resume;
  setPersonal: (key: keyof Resume["personal_info"], value: string) => void;
  setField: (key: keyof Resume, value: unknown) => void;
  upload: (file: File) => void;
  uploading: boolean;
}) {
  const p = resume.personal_info;
  return (
    <>
      <SectionHeading
        eyebrow="01 / Personal details"
        title="Start with the essentials."
        text="Give a hiring manager the clearest first impression of who you are and how to reach you."
      />
      <div className="mb-7 flex items-center gap-4 rounded-2xl border border-dashed border-[#c8d9cc] bg-[#f7faf7] p-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-sage text-xs font-bold text-moss">
          {p.profileImage ? (
            <img
              src={
                p.profileImage.startsWith("/")
                  ? `${API_URL}${p.profileImage}`
                  : p.profileImage
              }
              alt="Profile preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <ImagePlus size={21} />
          )}
        </div>
        <div>
          <p className="text-sm font-bold">
            Profile image{" "}
            <span className="font-normal text-slate-400">(optional)</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            JPG, PNG, or WebP · max 4 MB
          </p>
          <label className="mt-2 inline-block cursor-pointer text-xs font-bold text-moss hover:underline">
            {uploading ? "Uploading…" : "Choose image"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              disabled={uploading}
              onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
            />
          </label>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Full name *"
          placeholder="Aarav Mehta"
          value={p.fullName}
          onChange={(e) => setPersonal("fullName", e.target.value)}
        />
        <Input
          label="Professional title *"
          placeholder="Product designer"
          value={p.professionalTitle}
          onChange={(e) => setPersonal("professionalTitle", e.target.value)}
        />
        <Input
          label="Email *"
          type="email"
          placeholder="aarav@example.com"
          value={p.email}
          onChange={(e) => setPersonal("email", e.target.value)}
        />
        <Input
          label="Phone"
          placeholder="+91 98765 43210"
          value={p.phone}
          onChange={(e) => setPersonal("phone", e.target.value)}
        />
        <Input
          label="Location"
          placeholder="Bengaluru, India"
          value={p.location}
          onChange={(e) => setPersonal("location", e.target.value)}
        />
        <Input
          label="LinkedIn"
          placeholder="linkedin.com/in/aarav"
          value={p.linkedIn}
          onChange={(e) => setPersonal("linkedIn", e.target.value)}
        />
        <Input
          label="GitHub"
          placeholder="github.com/aarav"
          value={p.github}
          onChange={(e) => setPersonal("github", e.target.value)}
        />
        <Input
          label="Portfolio"
          placeholder="aarav.me"
          value={p.portfolio}
          onChange={(e) => setPersonal("portfolio", e.target.value)}
        />
      </div>
      <div className="mt-5">
        <TextArea
          label="Professional summary"
          placeholder="Two or three sentences about the value you bring, the work you enjoy, and the direction you are heading…"
          value={resume.summary}
          onChange={(e) => setField("summary", e.target.value)}
        />
      </div>
    </>
  );
}

function EducationStep({
  resume,
  setField,
  patchItem,
  removeItem,
}: {
  resume: Resume;
  setField: (key: keyof Resume, value: unknown) => void;
  patchItem: (
    key: Collection,
    id: string,
    field: string,
    value: unknown,
  ) => void;
  removeItem: (key: Collection, id: string) => void;
}) {
  const add = () =>
    setField("education", [
      ...resume.education,
      {
        id: uid(),
        degree: "",
        institution: "",
        field: "",
        startYear: "",
        endYear: "",
        cgpa: "",
      },
    ]);
  return (
    <>
      <SectionHeading
        eyebrow="02 / Education"
        title="Show your foundation."
        text="Add degrees, certifications, or the learning milestones that support your next move."
      />
      {resume.education.map((item) => (
        <Card key={item.id} className="mb-4 bg-[#fbfcfa] p-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-bold text-moss">Education entry</p>
            <button
              onClick={() => removeItem("education", item.id)}
              className="text-slate-400 hover:text-red-500"
            >
              <Trash2 size={16} />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Degree"
              placeholder="B.Tech"
              value={item.degree}
              onChange={(e) =>
                patchItem("education", item.id, "degree", e.target.value)
              }
            />
            <Input
              label="Institution"
              placeholder="University of Delhi"
              value={item.institution}
              onChange={(e) =>
                patchItem("education", item.id, "institution", e.target.value)
              }
            />
            <Input
              label="Field of study"
              placeholder="Computer Science"
              value={item.field}
              onChange={(e) =>
                patchItem("education", item.id, "field", e.target.value)
              }
            />
            <Input
              label="CGPA / score"
              placeholder="8.7 / 10"
              value={item.cgpa}
              onChange={(e) =>
                patchItem("education", item.id, "cgpa", e.target.value)
              }
            />
            <Input
              label="Start year"
              placeholder="2021"
              value={item.startYear}
              onChange={(e) =>
                patchItem("education", item.id, "startYear", e.target.value)
              }
            />
            <Input
              label="End year"
              placeholder="2025"
              value={item.endYear}
              onChange={(e) =>
                patchItem("education", item.id, "endYear", e.target.value)
              }
            />
          </div>
        </Card>
      ))}
      <Button variant="secondary" onClick={add}>
        <Plus size={15} />
        Add education
      </Button>
      {resume.education.length === 0 && (
        <EmptyHint text="No education entries yet. You can keep this section empty and add it later." />
      )}
    </>
  );
}

function ExperienceStep({
  resume,
  setField,
  patchItem,
  removeItem,
}: {
  resume: Resume;
  setField: (key: keyof Resume, value: unknown) => void;
  patchItem: (
    key: Collection,
    id: string,
    field: string,
    value: unknown,
  ) => void;
  removeItem: (key: Collection, id: string) => void;
}) {
  const add = () =>
    setField("experience", [
      ...resume.experience,
      {
        id: uid(),
        company: "",
        jobTitle: "",
        employmentType: "Full-time",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      },
    ]);
  return (
    <>
      <SectionHeading
        eyebrow="03 / Experience"
        title="Let the work speak."
        text="Focus on outcomes, not just responsibilities. Start each description with a strong verb when you can."
      />
      {resume.experience.map((item) => (
        <Card key={item.id} className="mb-4 bg-[#fbfcfa] p-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-bold text-moss">Experience entry</p>
            <button
              onClick={() => removeItem("experience", item.id)}
              className="text-slate-400 hover:text-red-500"
            >
              <Trash2 size={16} />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Job title"
              placeholder="Product design intern"
              value={item.jobTitle}
              onChange={(e) =>
                patchItem("experience", item.id, "jobTitle", e.target.value)
              }
            />
            <Input
              label="Company"
              placeholder="Acme Labs"
              value={item.company}
              onChange={(e) =>
                patchItem("experience", item.id, "company", e.target.value)
              }
            />
            <Select
              label="Employment type"
              value={item.employmentType}
              onChange={(e) =>
                patchItem(
                  "experience",
                  item.id,
                  "employmentType",
                  e.target.value,
                )
              }
            >
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Internship</option>
              <option>Freelance</option>
              <option>Contract</option>
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Start"
                type="month"
                value={item.startDate}
                onChange={(e) =>
                  patchItem("experience", item.id, "startDate", e.target.value)
                }
              />
              <Input
                label="End"
                type="month"
                value={item.endDate}
                disabled={item.current}
                onChange={(e) =>
                  patchItem("experience", item.id, "endDate", e.target.value)
                }
              />
            </div>
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-600">
            <input
              type="checkbox"
              checked={item.current}
              onChange={(e) =>
                patchItem("experience", item.id, "current", e.target.checked)
              }
              className="h-4 w-4 accent-moss"
            />
            I currently work here
          </label>
          <div className="mt-4">
            <TextArea
              label="What did you accomplish?"
              placeholder="Designed… Improved… Shipped…"
              value={item.description}
              onChange={(e) =>
                patchItem("experience", item.id, "description", e.target.value)
              }
            />
          </div>
        </Card>
      ))}
      <Button variant="secondary" onClick={add}>
        <Plus size={15} />
        Add experience
      </Button>
      {resume.experience.length === 0 && (
        <EmptyHint text="No experience entries yet. Projects and education can carry your story too." />
      )}
    </>
  );
}

function SkillsStep({
  resume,
  setField,
}: {
  resume: Resume;
  setField: (key: keyof Resume, value: unknown) => void;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const skill = draft.trim();
    if (skill && !resume.skills.includes(skill))
      setField("skills", [...resume.skills, skill]);
    setDraft("");
  };
  return (
    <>
      <SectionHeading
        eyebrow="04 / Skills"
        title="Name your superpowers."
        text="Add the tools, methods, and strengths you want to be remembered for. Keep each one crisp."
      />
      <div className="flex gap-2">
        <Input
          aria-label="Add a skill"
          placeholder="e.g. Figma, Python, User research"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
        />
        <Button onClick={add}>
          <Plus size={15} />
          Add
        </Button>
      </div>
      <div className="mt-7 flex min-h-32 flex-wrap content-start gap-2 rounded-2xl border border-dashed border-[#c8d9cc] bg-[#f7faf7] p-4">
        {resume.skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-2 rounded-full bg-sage px-3 py-2 text-sm font-semibold text-moss"
          >
            {skill}
            <button
              onClick={() =>
                setField(
                  "skills",
                  resume.skills.filter((item) => item !== skill),
                )
              }
              className="text-moss/60 hover:text-moss"
            >
              ×
            </button>
          </span>
        ))}
        {resume.skills.length === 0 && (
          <p className="text-sm text-slate-400">
            Your skills will collect here.
          </p>
        )}
      </div>
      <div className="mt-8 rounded-2xl bg-ink p-5 text-white">
        <p className="text-sm font-bold">A useful rule of thumb</p>
        <p className="mt-2 text-sm leading-6 text-sage">
          Aim for 8–12 skills that match the kinds of opportunities you actually
          want. Specific beats impressive-sounding.
        </p>
      </div>
    </>
  );
}

function ProjectsStep({
  resume,
  setField,
  patchItem,
  removeItem,
}: {
  resume: Resume;
  setField: (key: keyof Resume, value: unknown) => void;
  patchItem: (
    key: Collection,
    id: string,
    field: string,
    value: unknown,
  ) => void;
  removeItem: (key: Collection, id: string) => void;
}) {
  const add = () =>
    setField("projects", [
      ...resume.projects,
      { id: uid(), title: "", description: "", technologies: "" },
    ]);
  return (
    <>
      <SectionHeading
        eyebrow="05 / Projects"
        title="Make the proof visible."
        text="Projects turn potential into something a hiring manager can see, understand, and remember."
      />
      {resume.projects.map((item) => (
        <Card key={item.id} className="mb-4 bg-[#fbfcfa] p-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-bold text-moss">Project entry</p>
            <button
              onClick={() => removeItem("projects", item.id)}
              className="text-slate-400 hover:text-red-500"
            >
              <Trash2 size={16} />
            </button>
          </div>
          <Input
            label="Project title"
            placeholder="Orbit — student career platform"
            value={item.title}
            onChange={(e) =>
              patchItem("projects", item.id, "title", e.target.value)
            }
          />
          <div className="mt-4">
            <Input
              label="Technologies"
              placeholder="Next.js · FastAPI · PostgreSQL"
              value={item.technologies}
              onChange={(e) =>
                patchItem("projects", item.id, "technologies", e.target.value)
              }
            />
          </div>
          <div className="mt-4">
            <TextArea
              label="What did you build?"
              placeholder="Describe the problem, your contribution, and the result…"
              value={item.description}
              onChange={(e) =>
                patchItem("projects", item.id, "description", e.target.value)
              }
            />
          </div>
        </Card>
      ))}
      <Button variant="secondary" onClick={add}>
        <Plus size={15} />
        Add project
      </Button>
      {resume.projects.length === 0 && (
        <EmptyHint text="Projects are optional, but they are often the strongest proof of what you can do." />
      )}
    </>
  );
}

function PreviewStep({
  resume,
  setField,
}: {
  resume: Resume;
  setField: (key: keyof Resume, value: unknown) => void;
}) {
  return (
    <>
      <SectionHeading
        eyebrow="06 / Preview"
        title="Choose the shape of your story."
        text="Your content stays the same. The template changes how it lands."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {(Object.keys(templateMeta) as TemplateName[]).map((name) => (
          <button
            key={name}
            onClick={() => setField("template", name)}
            className={`rounded-2xl border p-4 text-left transition ${resume.template === name ? "border-moss bg-sage/50 ring-2 ring-sage" : "border-[#dfe8e1] bg-white hover:border-moss/50"}`}
          >
            <div
              className="mb-3 h-12 rounded-lg"
              style={{
                background: `linear-gradient(135deg, ${templateMeta[name].accent} 0 22%, #f0f3ef 22% 100%)`,
              }}
            />
            <p className="text-sm font-bold">{templateMeta[name].label}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {templateMeta[name].description}
            </p>
          </button>
        ))}
      </div>
      <div className="mt-6">
        <Input
          label="Resume name"
          value={resume.title}
          onChange={(e) => setField("title", e.target.value)}
          placeholder="Aarav — product design"
        />
      </div>
    </>
  );
}

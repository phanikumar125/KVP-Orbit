export type TemplateName = "classic" | "modern" | "professional" | "minimal" | "creative";

export type PersonalInfo = {
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  github: string;
  portfolio: string;
  profileImage: string;
};

export type Education = {
  id: string;
  degree: string;
  institution: string;
  field: string;
  startYear: string;
  endYear: string;
  cgpa: string;
};

export type Experience = {
  id: string;
  company: string;
  jobTitle: string;
  employmentType: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
};

export type Project = { id: string; title: string; description: string; technologies: string };

export type Resume = {
  id?: number;
  title: string;
  template: TemplateName;
  summary: string;
  personal_info: PersonalInfo;
  education: Education[];
  experience: Experience[];
  skills: string[];
  projects: Project[];
  certifications: { id: string; name: string; issuer: string; year: string }[];
  languages: { id: string; name: string; level: string }[];
  created_at?: string;
  updated_at?: string;
};

export const emptyResume: Resume = {
  title: "Untitled resume",
  template: "modern",
  summary: "",
  personal_info: { fullName: "", professionalTitle: "", email: "", phone: "", location: "", linkedIn: "", github: "", portfolio: "", profileImage: "" },
  education: [],
  experience: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
};

export const templateMeta: Record<TemplateName, { label: string; description: string; accent: string }> = {
  classic: { label: "Classic", description: "Timeless, editorial, and highly readable.", accent: "#486656" },
  modern: { label: "Modern", description: "Confident hierarchy with a calm green accent.", accent: "#e47b5f" },
  professional: { label: "Professional", description: "Structured and ready for serious hiring teams.", accent: "#1d4e5f" },
  minimal: { label: "Minimal", description: "Clean whitespace for a quiet, focused profile.", accent: "#282d2a" },
  creative: { label: "Creative", description: "A little more personality for creative roles.", accent: "#8e5a75" },
};


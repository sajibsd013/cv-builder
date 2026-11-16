export type CVTemplate = "europass" | "modern" | "ats";
export type CVFontFamily = "inter" | "jakarta" | "merriweather" | "roboto";
export type PhotoShape = "circle" | "square";

export type SectionKey =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "languages"
  | "custom";

export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  photo?: string;
  photoShape: PhotoShape;
  summary: string;
}

export interface ExperienceItem {
  id: string;
  jobTitle: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  achievements: string[];
  technologies: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
  achievements?: string[];
}

export interface SkillItem {
  id: string;
  name: string;
  category?: string;
  yearsOfExperience?: number;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  url?: string;
  repositoryUrl?: string;
  startDate?: string;
  endDate?: string;
  technologies: string[];
  highlights: string[];
}

export interface LanguageItem {
  id: string;
  language: string;
  proficiency: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  certification?: string;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  content: string;
}

export interface CustomSection {
  id: string;
  title: string;
  items: CustomSectionItem[];
}

export interface CVSettings {
  template: CVTemplate;
  accentColor: string;
  fontFamily: CVFontFamily;
  fontSize: number;
  sectionOrder: SectionKey[];
  showPhoto?: boolean;
  showIcons?: boolean;
  lineHeight?: number;
}

export interface CVProfile {
  id: string;
  name: string;
  personalInfo: PersonalInfo;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  languages: LanguageItem[];
  customSections: CustomSection[];
  settings: CVSettings;
  createdAt: string;
  updatedAt: string;
}

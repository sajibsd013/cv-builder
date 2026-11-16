import type { CVFontFamily, CVProfile, SectionKey } from "@/types/cv";

export const cvFontVariables: Record<CVFontFamily, string> = {
  inter: "var(--font-inter)",
  jakarta: "var(--font-jakarta)",
  merriweather: "var(--font-merriweather)",
  roboto: "var(--font-roboto)",
};

export function cvFontFamily(fontFamily: CVFontFamily): string {
  return cvFontVariables[fontFamily];
}

export function formatDate(value?: string): string {
  if (!value) return "Present";
  const [year, month] = value.split("-");
  if (!month) return year;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(new Date(Number(year), Number(month) - 1));
}

export function formatRange(start?: string, end?: string, current = false): string {
  return `${formatDate(start)} – ${current ? "Present" : formatDate(end)}`;
}

export function sectionTitle(section: SectionKey): string {
  const titles: Record<SectionKey, string> = {
    summary: "Profile",
    experience: "Work Experience",
    education: "Education",
    skills: "Skills",
    projects: "Projects",
    languages: "Languages",
    custom: "Additional Information",
  };
  return titles[section];
}

export function orderedSections(profile: CVProfile): SectionKey[] {
  return profile.settings.sectionOrder;
}

export function contactLinks(profile: CVProfile): string[] {
  return [
    profile.personalInfo.email,
    profile.personalInfo.phone,
    profile.personalInfo.location,
    profile.personalInfo.website,
    profile.personalInfo.linkedin,
    profile.personalInfo.github,
  ].filter((value): value is string => Boolean(value));
}

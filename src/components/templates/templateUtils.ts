import { createElement, type ReactNode } from "react";
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

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return createElement("strong", { key: `${keyPrefix}-bold-${index}` }, part.slice(2, -2));
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return createElement("em", { key: `${keyPrefix}-italic-${index}` }, part.slice(1, -1));
    }
    return createElement("span", { key: `${keyPrefix}-text-${index}` }, part);
  });
}

export function renderFormattedText(text: string): ReactNode {
  const lines = text.split(/\r?\n/);
  const nodes: ReactNode[] = [];
  let bullets: string[] = [];
  const flushBullets = () => {
    if (!bullets.length) return;
    nodes.push(createElement("ul", { key: `list-${nodes.length}`, className: "list-disc pl-4" },
      bullets.map((line, index) => createElement("li", { key: `bullet-${index}` }, renderInline(line, `bullet-${index}`)))));
    bullets = [];
  };
  lines.forEach((line, index) => {
    const bulletText = line.match(/^\s*[•*-]\s+(.*)$/)?.[1];
    if (bulletText !== undefined) {
      bullets.push(bulletText);
      return;
    }
    flushBullets();
    if (line) nodes.push(createElement("span", { key: `line-${index}` }, renderInline(line, `line-${index}`)));
    if (index < lines.length - 1 && !lines[index + 1].match(/^\s*[•*-]\s+/)) nodes.push(createElement("br", { key: `break-${index}` }));
  });
  flushBullets();
  return nodes;
}

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import {
  contactLinks,
  cvFontFamily,
  formatRange,
  orderedSections,
  sectionTitle,
} from "@/components/templates/templateUtils";
import type { CVProfile, SectionKey } from "@/types/cv";

interface ModernTemplateProps {
  profile: CVProfile;
  className?: string;
}

const A4_HEIGHT_PX = 1122;

export function ModernTemplate({ profile, className = "" }: ModernTemplateProps) {
  const { personalInfo, settings } = profile;
  const sidebarRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const measuredProfileRef = useRef<CVProfile | null>(null);
  const [compact, setCompact] = useState(false);
  const [scaleFactor, setScaleFactor] = useState(1);

  useLayoutEffect(() => {
    const sidebar = sidebarRef.current;
    const main = mainRef.current;
    if (!sidebar || !main) return;

    const profileChanged = measuredProfileRef.current !== null && measuredProfileRef.current !== profile;
    measuredProfileRef.current = profile;
    if (profileChanged) {
      setCompact(false);
      setScaleFactor(1);
      return;
    }

    const measure = () => {
      const contentHeight = Math.max(sidebar.scrollHeight, main.scrollHeight);
      if (!compact && contentHeight > A4_HEIGHT_PX) {
        setCompact(true);
        return;
      }

      setScaleFactor(contentHeight > A4_HEIGHT_PX ? Math.max(0.72, A4_HEIGHT_PX / contentHeight) : 1);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(sidebar);
    observer.observe(main);
    return () => observer.disconnect();
  }, [compact, profile]);

  const fitActive = compact || scaleFactor < 1;
  const fittedPercent = Math.round(scaleFactor * 100);
  const renderSection = (section: SectionKey) => {
    const heading = <h2 className="mb-3 text-[12px] font-bold uppercase tracking-[0.18em]" style={{ color: settings.accentColor }}>{sectionTitle(section)}</h2>;
    switch (section) {
      case "summary":
        return <section key={section}>{heading}<p className="text-[10px] leading-[1.65] text-slate-600">{personalInfo.summary}</p></section>;
      case "experience":
        return <section key={section}>{heading}<div className="space-y-4">{profile.experience.map((item) => <article key={item.id} className="break-inside-avoid"><div className="flex items-start justify-between gap-3"><div><h3 className="text-[11px] font-bold text-slate-900">{item.jobTitle}</h3><p className="text-[10px] font-medium text-slate-500">{item.company}{item.location ? ` · ${item.location}` : ""}</p></div><span className="whitespace-nowrap text-[9px] text-slate-400">{formatRange(item.startDate, item.endDate, item.isCurrent)}</span></div>{item.description && <p className="mt-1 text-[10px] leading-4 text-slate-600">{item.description}</p>}<ul className="mt-1 list-disc space-y-0.5 pl-4 text-[10px] leading-4 text-slate-600">{item.achievements.map((achievement) => <li key={achievement}>{achievement}</li>)}</ul></article>)}</div></section>;
      case "projects":
        return <section key={section}>{heading}<div className="grid gap-3 sm:grid-cols-2">{profile.projects.map((project) => <article key={project.id} className="break-inside-avoid rounded-lg border border-slate-200 p-3"><h3 className="text-[11px] font-bold text-slate-900">{project.name}</h3><p className="mt-1 text-[10px] leading-4 text-slate-600">{project.description}</p><p className="mt-2 text-[9px] font-medium" style={{ color: settings.accentColor }}>{project.technologies.join(" · ")}</p></article>)}</div></section>;
      case "education":
        return <section key={section}>{heading}<div className="space-y-3">{profile.education.map((item) => <article key={item.id} className="flex justify-between gap-3 break-inside-avoid"><div><h3 className="text-[11px] font-bold text-slate-900">{item.degree}</h3><p className="text-[10px] text-slate-600">{item.institution}{item.location ? ` · ${item.location}` : ""}</p></div><span className="text-[9px] text-slate-400">{formatRange(item.startDate, item.endDate, item.isCurrent)}</span></article>)}</div></section>;
      case "custom":
        return profile.customSections.map((custom) => <section key={custom.id}>{<h2 className="mb-3 text-[12px] font-bold uppercase tracking-[0.18em]" style={{ color: settings.accentColor }}>{custom.title}</h2>}<div className="space-y-2 text-[10px]">{custom.items.map((item) => <div key={item.id}><strong>{item.title}</strong><p className="text-slate-600">{item.content}</p></div>)}</div></section>);
      default:
        return null;
    }
  };

  const sidebarSections = new Set<SectionKey>(["skills", "languages"]);
  const mainSections = orderedSections(profile).filter((section) => !sidebarSections.has(section));
  const sideSections = orderedSections(profile).filter((section) => sidebarSections.has(section));

  return (
    <article className={`cv-template print-page-modern relative m-0 grid h-[297mm] max-h-[297mm] min-h-[297mm] w-[210mm] grid-cols-[66mm_1fr] overflow-hidden bg-white p-0 shadow-lg print:fixed print:left-0 print:top-0 print:z-50 print:m-0 print:h-[297mm] print:max-h-[297mm] print:w-[210mm] print:overflow-hidden print:shadow-none ${className}`} style={{ fontFamily: cvFontFamily(settings.fontFamily), fontSize: `${settings.fontSize}pt` }}>
      {fitActive && <span className="absolute right-3 top-3 z-10 rounded-full bg-slate-900/75 px-2.5 py-1 text-[9px] font-medium text-white print:hidden">Auto-fitted to 1 page ({fittedPercent}%)</span>}
      <aside className={`w-[66mm] shrink-0 overflow-hidden p-6 text-white ${compact ? "space-y-1 p-5" : ""}`} style={{ backgroundColor: settings.accentColor }}>
        <div ref={sidebarRef} className="origin-top-left" style={{ width: `${100 / scaleFactor}%`, transform: `scale(${scaleFactor})` }}>
        {personalInfo.photo && <Image src={personalInfo.photo} alt="" width={112} height={112} unoptimized className={`${compact ? "mb-3" : "mb-5"} h-28 w-28 shrink-0 aspect-square border-4 border-white/30 object-cover ${personalInfo.photoShape === "circle" ? "rounded-full" : "rounded-xl"}`} />}
        <h1 className="text-[22px] font-bold leading-tight">{personalInfo.fullName}</h1>
        <p className="mt-2 text-[12px] font-medium text-white/80">{personalInfo.jobTitle}</p>
        <div className={`${compact ? "mt-4" : "mt-7"} space-y-2 break-words text-[9px] leading-4 text-white/80`}>{contactLinks(profile).map((link) => <div key={link}>{link}</div>)}</div>
        {sideSections.map((section) => <section key={section} className={compact ? "mt-5" : "mt-8"}>{section === "skills" && <><h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white">{sectionTitle(section)}</h2><div className="flex flex-wrap gap-1.5">{profile.skills.map((skill) => <span key={skill.id} className="rounded-full bg-white/15 px-2 py-1 text-[9px]">{skill.name}</span>)}</div></>}{section === "languages" && <><h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white">{sectionTitle(section)}</h2><div className="space-y-2 text-[10px]">{profile.languages.map((language) => <div key={language.id} className="flex justify-between gap-2"><span>{language.language}</span><strong>{language.proficiency}</strong></div>)}</div></>}</section>)}
        </div>
      </aside>
      <main className={`min-w-0 overflow-hidden text-slate-900 ${compact ? "p-5" : "p-7"}`}>
        <div ref={mainRef} className={`origin-top-left ${compact ? "space-y-4" : "space-y-6"}`} style={{ width: `${100 / scaleFactor}%`, transform: `scale(${scaleFactor})` }}>{mainSections.map(renderSection)}</div>
      </main>
    </article>
  );
}

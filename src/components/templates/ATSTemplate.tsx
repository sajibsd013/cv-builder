import {
  formatRange,
  cvFontFamily,
  orderedSections,
  sectionTitle,
} from "@/components/templates/templateUtils";
import type { CVProfile, SectionKey } from "@/types/cv";

interface ATSTemplateProps {
  profile: CVProfile;
  className?: string;
}

export function ATSTemplate({ profile, className = "" }: ATSTemplateProps) {
  const { personalInfo, settings } = profile;
  const heading = (section: SectionKey) => <h2 className="mb-3 border-b border-slate-900 pb-1 text-[12px] font-bold uppercase tracking-wide text-slate-900">{sectionTitle(section)}</h2>;
  const renderSection = (section: SectionKey) => {
    switch (section) {
      case "summary":
        return <section key={section}>{heading(section)}<p className="text-[10px] leading-[1.55]">{personalInfo.summary}</p></section>;
      case "experience":
        return <section key={section}>{heading(section)}<div className="space-y-4">{profile.experience.map((item) => <article key={item.id} className="break-inside-avoid"><div className="flex justify-between gap-3"><div><h3 className="text-[11px] font-bold">{item.jobTitle}</h3><p className="text-[10px]">{item.company}{item.location ? `, ${item.location}` : ""}</p></div><span className="text-[9px]">{formatRange(item.startDate, item.endDate, item.isCurrent)}</span></div>{item.description && <p className="mt-1 text-[10px] leading-4">{item.description}</p>}<ul className="mt-1 list-disc space-y-0.5 pl-4 text-[10px] leading-4">{item.achievements.map((achievement) => <li key={achievement}>{achievement}</li>)}</ul><p className="mt-1 text-[9px]">{item.technologies.join(", ")}</p></article>)}</div></section>;
      case "education":
        return <section key={section}>{heading(section)}<div className="space-y-3">{profile.education.map((item) => <article key={item.id} className="flex justify-between gap-3 break-inside-avoid"><div><h3 className="text-[11px] font-bold">{item.degree}</h3><p className="text-[10px]">{item.institution}{item.location ? `, ${item.location}` : ""}</p></div><span className="text-[9px]">{formatRange(item.startDate, item.endDate, item.isCurrent)}</span></article>)}</div></section>;
      case "skills":
        return <section key={section}>{heading(section)}<p className="text-[10px] leading-5">{profile.skills.map((skill) => skill.name).join("  |  ")}</p></section>;
      case "projects":
        return <section key={section}>{heading(section)}<div className="space-y-3">{profile.projects.map((project) => <article key={project.id} className="break-inside-avoid"><h3 className="text-[11px] font-bold">{project.name}</h3><p className="text-[10px] leading-4">{project.description}</p><p className="mt-1 text-[9px]">{project.technologies.join(", ")}</p></article>)}</div></section>;
      case "languages":
        return <section key={section}>{heading(section)}<p className="text-[10px]">{profile.languages.map((language) => `${language.language} (${language.proficiency})`).join("  |  ")}</p></section>;
      case "custom":
        return profile.customSections.map((custom) => <section key={custom.id}>{<h2 className="mb-3 border-b border-slate-900 pb-1 text-[12px] font-bold uppercase tracking-wide text-slate-900">{custom.title}</h2>}<div className="space-y-2 text-[10px]">{custom.items.map((item) => <p key={item.id}><strong>{item.title}:</strong> {item.content}</p>)}</div></section>);
    }
  };

  return (
    <article className={`cv-template mx-auto min-h-[297mm] w-[210mm] bg-white p-6 text-slate-900 print:p-0 print:shadow-none ${className}`} style={{ fontFamily: cvFontFamily(settings.fontFamily), fontSize: `${settings.fontSize}pt` }}>
      <header className="mb-7 border-b-2 border-slate-900 pb-4 text-center">
        <h1 className="text-[25px] font-bold tracking-tight">{personalInfo.fullName}</h1>
        <p className="mt-1 text-[13px]">{personalInfo.jobTitle}</p>
        <p className="mt-3 text-[9px]">{[personalInfo.email, personalInfo.phone, personalInfo.location, personalInfo.website].filter(Boolean).join(" | ")}</p>
      </header>
      <div className="space-y-5">{orderedSections(profile).flatMap(renderSection)}</div>
    </article>
  );
}

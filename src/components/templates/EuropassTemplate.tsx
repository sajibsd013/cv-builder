import Image from "next/image";
import {
  contactLinks,
  cvFontFamily,
  formatRange,
  orderedSections,
  sectionTitle,
} from "@/components/templates/templateUtils";
import type { CVProfile, SectionKey } from "@/types/cv";
import { cn } from "@/lib/utils";

interface EuropassTemplateProps {
  profile: CVProfile;
  className?: string;
}

function SectionHeading({ section }: { section: SectionKey }) {
  return (
    <h2 className="mb-3 border-b-2 border-[#1d70b8] pb-1 text-[13px] font-bold uppercase tracking-wide text-[#1d70b8]">
      {sectionTitle(section)}
    </h2>
  );
}

export function EuropassTemplate({ profile, className = "" }: EuropassTemplateProps) {
  const { personalInfo, settings } = profile;
  const renderSection = (section: SectionKey) => {
    switch (section) {
      case "summary":
        return (
          <section key={section}>
            <SectionHeading section={section} />
            <p className="text-[10px] leading-[1.55] text-slate-700">{personalInfo.summary}</p>
          </section>
        );
      case "experience":
        return (
          <section key={section}>
            <SectionHeading section={section} />
            <div className="space-y-4">
              {profile.experience.map((item) => (
                <article key={item.id} className="grid grid-cols-[116px_1fr] gap-4 break-inside-avoid">
                  <div className="text-[9px] leading-4 text-slate-500">
                    <div>{formatRange(item.startDate, item.endDate, item.isCurrent)}</div>
                    {item.location && <div>{item.location}</div>}
                  </div>
                  <div>
                    <h3 className="text-[11px] font-bold text-slate-900">{item.jobTitle}</h3>
                    <p className="text-[10px] font-semibold text-slate-700">{item.company}</p>
                    {item.description && <p className="mt-1 text-[10px] leading-4 text-slate-700">{item.description}</p>}
                    <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[10px] leading-4 text-slate-700">
                      {item.achievements.map((achievement) => <li key={achievement}>{achievement}</li>)}
                    </ul>
                    {item.technologies.length > 0 && <p className="mt-1 text-[9px] text-slate-500">{item.technologies.join(" · ")}</p>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      case "education":
        return (
          <section key={section}>
            <SectionHeading section={section} />
            <div className="space-y-3">
              {profile.education.map((item) => (
                <article key={item.id} className="grid grid-cols-[116px_1fr] gap-4 break-inside-avoid">
                  <div className="text-[9px] text-slate-500">{formatRange(item.startDate, item.endDate, item.isCurrent)}</div>
                  <div>
                    <h3 className="text-[11px] font-bold text-slate-900">{item.degree}</h3>
                    <p className="text-[10px] text-slate-700">{item.institution}{item.location ? `, ${item.location}` : ""}</p>
                    {item.description && <p className="mt-1 text-[10px] leading-4 text-slate-700">{item.description}</p>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      case "skills":
        return (
          <section key={section}>
            <SectionHeading section={section} />
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              {profile.skills.map((skill) => (
                <div key={skill.id} className="border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-800">{skill.name}</div>
              ))}
            </div>
          </section>
        );
      case "projects":
        return (
          <section key={section}>
            <SectionHeading section={section} />
            <div className="space-y-3">
              {profile.projects.map((project) => (
                <article key={project.id} className="break-inside-avoid">
                  <h3 className="text-[11px] font-bold text-slate-900">{project.name}</h3>
                  <p className="text-[10px] leading-4 text-slate-700">{project.description}</p>
                  {project.highlights.length > 0 && <ul className="mt-1 list-disc pl-4 text-[10px] leading-4 text-slate-700">{project.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>}
                </article>
              ))}
            </div>
          </section>
        );
      case "languages":
        return (
          <section key={section}>
            <SectionHeading section={section} />
            <div className="grid grid-cols-2 gap-2">
              {profile.languages.map((language) => (
                <div key={language.id} className="flex items-center justify-between border border-slate-200 px-2 py-1.5 text-[10px]">
                  <span className="font-semibold text-slate-800">{language.language}</span>
                  <span className="font-bold text-[#1d70b8]">{language.proficiency}</span>
                </div>
              ))}
            </div>
          </section>
        );
      case "custom":
        return profile.customSections.map((custom) => (
          <section key={custom.id}>
            <h2 className="mb-3 border-b-2 border-[#1d70b8] pb-1 text-[13px] font-bold uppercase tracking-wide text-[#1d70b8]">{custom.title}</h2>
            <div className="space-y-2">{custom.items.map((item) => <div key={item.id} className="grid grid-cols-[160px_1fr] gap-4 text-[10px]"><strong>{item.title}</strong><span className="text-slate-700">{item.content}</span></div>)}</div>
          </section>
        ));
    }
  };

  return (
    <article
      className={`cv-template mx-auto min-h-[297mm] w-[210mm] bg-white p-6 font-sans text-slate-900 shadow-lg print:p-0 print:shadow-none ${className}`}
      style={{ fontFamily: cvFontFamily(settings.fontFamily), fontSize: `${settings.fontSize}pt` }}
    >
      <header className="mb-6 flex items-start gap-5 border-b border-slate-300 pb-5">
        {personalInfo.photo && <Image src={personalInfo.photo} alt="" width={112} height={112} unoptimized className={cn("h-28 w-28 shrink-0 aspect-square object-cover", personalInfo.photoShape === "circle" ? "rounded-full" : "rounded-xl")} />}
        <div className="flex-1">
          <h1 className="text-[25px] font-bold tracking-tight text-[#1d70b8]">{personalInfo.fullName}</h1>
          <p className="mt-1 text-[14px] font-semibold text-slate-700">{personalInfo.jobTitle}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[9px] text-slate-600">{contactLinks(profile).map((link) => <span key={link}>{link}</span>)}</div>
        </div>
      </header>
      <div className="space-y-5">{orderedSections(profile).flatMap(renderSection)}</div>
    </article>
  );
}

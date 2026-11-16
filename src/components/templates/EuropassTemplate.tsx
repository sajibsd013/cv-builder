import type { ReactNode } from "react";
import Image from "next/image";
import {
  ExternalLink,
  FolderKanban,
  Globe,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import {
  cvFontFamily,
  formatRange,
  orderedSections,
  renderFormattedText,
  sectionTitle,
} from "@/components/templates/templateUtils";
import type { CVProfile, SectionKey } from "@/types/cv";
import { cn } from "@/lib/utils";

interface EuropassTemplateProps {
  profile: CVProfile;
  className?: string;
}

const EUROPASS_BLUE = "#1d70b8";

function normalizeHref(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function formatSocialHandle(rawUrl: string, prefixPattern: RegExp): string {
  return rawUrl
    .trim()
    .replace(/^https?:\/\/(www\.)?/i, "")
    .replace(prefixPattern, "")
    .replace(/\/$/, "");
}

function SectionHeading({
  title,
  accent,
}: {
  title: string;
  accent: string;
}) {
  return (
    <h2
      className="mb-3 border-b-2 pb-1 text-[13px] font-bold uppercase tracking-wide"
      style={{ borderColor: accent, color: accent }}
    >
      {title}
    </h2>
  );
}

interface HeaderContactItem {
  key: string;
  label: string;
  href?: string;
  icon: ReactNode;
}

function buildHeaderContacts(
  personalInfo: CVProfile["personalInfo"]
): HeaderContactItem[] {
  const items: HeaderContactItem[] = [];

  if (personalInfo.email?.trim()) {
    const email = personalInfo.email.trim();
    items.push({
      key: "email",
      label: email,
      href: `mailto:${email}`,
      icon: <Mail className="size-3 shrink-0" />,
    });
  }

  if (personalInfo.phone?.trim()) {
    const phone = personalInfo.phone.trim();
    items.push({
      key: "phone",
      label: phone,
      href: `tel:${phone.replace(/[^\d+]/g, "")}`,
      icon: <Phone className="size-3 shrink-0" />,
    });
  }

  if (personalInfo.location?.trim()) {
    items.push({
      key: "location",
      label: personalInfo.location.trim(),
      icon: <MapPin className="size-3 shrink-0" />,
    });
  }

  if (personalInfo.website?.trim()) {
    const raw = personalInfo.website.trim();
    items.push({
      key: "website",
      label: formatSocialHandle(raw, /^$/),
      href: normalizeHref(raw),
      icon: <Globe className="size-3 shrink-0" />,
    });
  }

  if (personalInfo.portfolio?.trim()) {
    const raw = personalInfo.portfolio.trim();
    items.push({
      key: "portfolio",
      label: formatSocialHandle(raw, /^$/),
      href: normalizeHref(raw),
      icon: <FolderKanban className="size-3 shrink-0" />,
    });
  }

  if (personalInfo.linkedin?.trim()) {
    const raw = personalInfo.linkedin.trim();
    const handle = formatSocialHandle(raw, /^linkedin\.com\//i);
    items.push({
      key: "linkedin",
      label: handle.startsWith("in/") ? handle : `in/${handle}`,
      href: normalizeHref(
        raw.includes("linkedin.com") ? raw : `https://linkedin.com/in/${handle}`
      ),
      icon: (
        <svg
          className="size-3 shrink-0 fill-current"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      ),
    });
  }

  if (personalInfo.github?.trim()) {
    const raw = personalInfo.github.trim();
    const username = formatSocialHandle(raw, /^github\.com\//i);
    items.push({
      key: "github",
      label: `github.com/${username}`,
      href: normalizeHref(
        raw.includes("github.com") ? raw : `https://github.com/${username}`
      ),
      icon: (
        <svg
          className="size-3 shrink-0 fill-current"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
        </svg>
      ),
    });
  }

  return items;
}

export function EuropassTemplate({
  profile,
  className = "",
}: EuropassTemplateProps) {
  const { personalInfo, settings } = profile;
  const accent = settings.accentColor || EUROPASS_BLUE;
  const headerContacts = buildHeaderContacts(personalInfo);

  const renderSection = (section: SectionKey) => {
    switch (section) {
      case "summary":
        if (!personalInfo.summary?.trim()) return null;
        return (
          <section key={section}>
            <SectionHeading title={sectionTitle(section)} accent={accent} />
            <p className="text-[10px] leading-[1.55] text-slate-700">
              {renderFormattedText(personalInfo.summary)}
            </p>
          </section>
        );

      case "experience":
        if (!profile.experience.length) return null;
        return (
          <section key={section}>
            <SectionHeading title={sectionTitle(section)} accent={accent} />
            <div className="space-y-4">
              {profile.experience.map((item) => (
                <article
                  key={item.id}
                  className="grid grid-cols-[116px_1fr] gap-4 break-inside-avoid"
                >
                  <div className="text-[9px] leading-4 text-slate-500">
                    <div>
                      {formatRange(item.startDate, item.endDate, item.isCurrent)}
                    </div>
                    {item.location && <div>{item.location}</div>}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[11px] font-bold text-slate-900">
                      {item.jobTitle}
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-700">
                      {item.company}
                    </p>
                    {item.description && (
                      <p className="mt-1 text-[10px] leading-4 text-slate-700">
                        {renderFormattedText(item.description)}
                      </p>
                    )}
                    {item.achievements.filter(Boolean).length > 0 && (
                      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[10px] leading-4 text-slate-700">
                        {item.achievements.filter(Boolean).map((achievement, idx) => (
                          <li key={`${item.id}-ach-${idx}`}>
                            {renderFormattedText(achievement)}
                          </li>
                        ))}
                      </ul>
                    )}
                    {item.technologies.length > 0 && (
                      <p className="mt-1 text-[9px] text-slate-500">
                        {item.technologies.join(" · ")}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        );

      case "education":
        if (!profile.education.length) return null;
        return (
          <section key={section}>
            <SectionHeading title={sectionTitle(section)} accent={accent} />
            <div className="space-y-3">
              {profile.education.map((item) => (
                <article
                  key={item.id}
                  className="grid grid-cols-[116px_1fr] gap-4 break-inside-avoid"
                >
                  <div className="text-[9px] leading-4 text-slate-500">
                    <div>
                      {formatRange(item.startDate, item.endDate, item.isCurrent)}
                    </div>
                    {item.location && <div>{item.location}</div>}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[11px] font-bold text-slate-900">
                      {item.degree}
                    </h3>
                    <p className="text-[10px] text-slate-700">
                      {item.institution}
                    </p>
                    {item.description && (
                      <p className="mt-1 text-[10px] leading-4 text-slate-700">
                        {renderFormattedText(item.description)}
                      </p>
                    )}
                    {item.achievements?.filter(Boolean).length ? (
                      <ul className="mt-1 list-disc pl-4 text-[10px] leading-4 text-slate-700">
                        {item.achievements.filter(Boolean).map((achievement, idx) => (
                          <li key={`${item.id}-edu-${idx}`}>
                            {renderFormattedText(achievement)}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        );

      case "skills": {
        const validSkills = (profile.skills ?? []).filter((s) =>
          s.name?.trim()
        );
        if (!validSkills.length) return null;

        const skillGroups: Record<string, string[]> = {};
        for (const skill of validSkills) {
          const category = skill.category?.trim() || "Core Skills";
          if (!skillGroups[category]) {
            skillGroups[category] = [];
          }
          skillGroups[category].push(
            skill.yearsOfExperience
              ? `${skill.name.trim()} (${skill.yearsOfExperience}y)`
              : skill.name.trim()
          );
        }

        return (
          <section key={section} className="break-inside-avoid">
            <SectionHeading title={sectionTitle(section)} accent={accent} />
            <div className="space-y-1.5 text-[10px]">
              {Object.entries(skillGroups).map(([category, skills]) => (
                <div
                  key={category}
                  className="grid grid-cols-[140px_1fr] gap-4"
                >
                  <span className="font-medium text-slate-500">{category}</span>
                  <span className="min-w-0 text-slate-800">
                    {skills.join(", ")}
                  </span>
                </div>
              ))}
            </div>
          </section>
        );
      }

      case "projects":
        if (!profile.projects.length) return null;
        return (
          <section key={section}>
            <SectionHeading title={sectionTitle(section)} accent={accent} />
            <div className="space-y-3">
              {profile.projects.map((project) => {
                const hasDate = Boolean(project.startDate || project.endDate);
                const hasLinks = Boolean(
                  project.url?.trim() || project.repositoryUrl?.trim()
                );

                return (
                  <article
                    key={project.id}
                    className="grid grid-cols-[116px_1fr] gap-4 break-inside-avoid"
                  >
                    <div className="text-[9px] leading-4 text-slate-500">
                      {hasDate
                        ? formatRange(
                            project.startDate ?? "",
                            project.endDate,
                            false
                          )
                        : "Project"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-[11px] font-bold text-slate-900">
                          {project.name}
                        </h3>

                        {hasLinks && (
                          <div className="flex items-center gap-2 text-[9px] font-semibold">
                            {project.url?.trim() && (
                              <a
                                href={normalizeHref(project.url)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 transition hover:bg-slate-100"
                                style={{ color: accent }}
                              >
                                <ExternalLink className="size-2.5" />
                                <span>Live Demo</span>
                              </a>
                            )}
                            {project.repositoryUrl?.trim() && (
                              <a
                                href={normalizeHref(project.repositoryUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-slate-700 transition hover:bg-slate-100"
                              >
                                <svg
                                  className="size-2.5 fill-current"
                                  viewBox="0 0 24 24"
                                  aria-hidden="true"
                                >
                                  <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
                                </svg>
                                <span>GitHub</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      {project.description && (
                        <p className="mt-1 text-[10px] leading-4 text-slate-700">
                          {renderFormattedText(project.description)}
                        </p>
                      )}
                      {project.highlights.filter(Boolean).length > 0 && (
                        <ul className="mt-1 list-disc pl-4 text-[10px] leading-4 text-slate-700">
                          {project.highlights.filter(Boolean).map((highlight, idx) => (
                            <li key={`${project.id}-hl-${idx}`}>
                              {renderFormattedText(highlight)}
                            </li>
                          ))}
                        </ul>
                      )}
                      {project.technologies.length > 0 && (
                        <p className="mt-1 text-[9px] text-slate-500">
                          {project.technologies.join(" · ")}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );

      case "languages":
        if (!profile.languages.length) return null;
        return (
          <section key={section}>
            <SectionHeading title={sectionTitle(section)} accent={accent} />
            <div className="grid grid-cols-2 gap-2">
              {profile.languages.map((language) => (
                <div
                  key={language.id}
                  className="flex items-center justify-between border border-slate-200 px-2.5 py-1.5 text-[10px]"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-semibold text-slate-800">
                      {language.language}
                    </span>
                    {language.certification && (
                      <span className="ml-1.5 text-[9px] text-slate-500">
                        ({language.certification})
                      </span>
                    )}
                  </div>
                  <span className="shrink-0 font-bold" style={{ color: accent }}>
                    {language.proficiency}
                  </span>
                </div>
              ))}
            </div>
          </section>
        );

      case "custom":
        return profile.customSections
          .filter((custom) => custom.items.length > 0)
          .map((custom) => (
            <section key={custom.id}>
              <SectionHeading title={custom.title} accent={accent} />
              <div className="space-y-2">
                {custom.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[160px_1fr] gap-4 text-[10px]"
                  >
                    <strong>{item.title}</strong>
                    <span className="min-w-0 text-slate-700">
                      {renderFormattedText(item.content)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ));
    }
  };

  return (
    <article
      className={cn(
        "cv-template mx-auto min-h-[297mm] w-[210mm] bg-white p-6 font-sans text-slate-900 shadow-lg print:w-full print:p-0 print:shadow-none",
        className
      )}
      style={{
        fontFamily: cvFontFamily(settings.fontFamily),
        fontSize: `${settings.fontSize}pt`,
      }}
    >
      <header className="mb-6 flex items-start gap-5 border-b border-slate-300 pb-5">
        {personalInfo.photo && (
          <Image
            src={personalInfo.photo}
            alt={personalInfo.fullName || ""}
            width={112}
            height={112}
            unoptimized
            className={cn(
              "h-28 w-28 shrink-0 aspect-square object-cover",
              personalInfo.photoShape === "circle" ? "rounded-full" : "rounded-xl"
            )}
          />
        )}
        <div className="min-w-0 flex-1">
          <h1
            className="text-[25px] font-bold tracking-tight"
            style={{ color: accent }}
          >
            {personalInfo.fullName}
          </h1>
          <p className="mt-1 text-[14px] font-semibold text-slate-700">
            {personalInfo.jobTitle}
          </p>

          {headerContacts.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[9.5px] text-slate-600">
              {headerContacts.map((item) =>
                item.href ? (
                  <a
                    key={item.key}
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                    className="inline-flex items-center gap-1.5 text-slate-700 transition hover:underline"
                  >
                    <span style={{ color: accent }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                ) : (
                  <span
                    key={item.key}
                    className="inline-flex items-center gap-1.5 text-slate-600"
                  >
                    <span style={{ color: accent }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                )
              )}
            </div>
          )}
        </div>
      </header>
      <div className="space-y-5">
        {orderedSections(profile).flatMap(renderSection)}
      </div>
    </article>
  );
}
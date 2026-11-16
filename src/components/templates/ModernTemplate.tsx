import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
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

interface ModernTemplateProps {
  profile: CVProfile;
  className?: string;
}

const A4_HEIGHT_PX = 1122;

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

interface SidebarContactItem {
  key: string;
  label: string;
  href?: string;
  icon: ReactNode;
}

function buildSidebarContacts(
  personalInfo: CVProfile["personalInfo"]
): SidebarContactItem[] {
  const items: SidebarContactItem[] = [];

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

export function ModernTemplate({
  profile,
  className = "",
}: ModernTemplateProps) {
  const { personalInfo, settings } = profile;
  const sidebarRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const [fitState, setFitState] = useState<{
    profileRef: CVProfile | null;
    compact: boolean;
    scaleFactor: number;
  }>({
    profileRef: null,
    compact: false,
    scaleFactor: 1,
  });

  const isStale = fitState.profileRef !== profile;
  const compact = isStale ? false : fitState.compact;
  const scaleFactor = isStale ? 1 : fitState.scaleFactor;

  useLayoutEffect(() => {
    const sidebar = sidebarRef.current;
    const main = mainRef.current;
    if (!sidebar || !main) return;

    if (isStale) {
      const naturalHeight = Math.max(sidebar.scrollHeight, main.scrollHeight);
      if (naturalHeight > A4_HEIGHT_PX) {
        setFitState({ profileRef: profile, compact: true, scaleFactor: 1 });
      } else {
        setFitState({ profileRef: profile, compact: false, scaleFactor: 1 });
      }
      return;
    }

    if (compact && scaleFactor === 1) {
      const compactHeight = Math.max(sidebar.scrollHeight, main.scrollHeight);
      const nextScale =
        compactHeight > A4_HEIGHT_PX
          ? Math.max(0.72, Math.floor((A4_HEIGHT_PX / compactHeight) * 100) / 100)
          : 1;
      setFitState({ profileRef: profile, compact: true, scaleFactor: nextScale });
    }
  }, [profile, isStale, compact, scaleFactor]);

  const fitActive = compact || scaleFactor < 1;
  const fittedPercent = Math.round(scaleFactor * 100);
  const sidebarContacts = buildSidebarContacts(personalInfo);

  const renderSection = (section: SectionKey) => {
    const heading = (
      <h2
        className={`${compact ? "mb-2" : "mb-3"} text-[12px] font-bold uppercase tracking-[0.18em]`}
        style={{ color: settings.accentColor }}
      >
        {sectionTitle(section)}
      </h2>
    );

    switch (section) {
      case "summary":
        if (!personalInfo.summary?.trim()) return null;
        return (
          <section key={section}>
            {heading}
            <p className="text-[10px] leading-[1.6] text-slate-600">
              {renderFormattedText(personalInfo.summary)}
            </p>
          </section>
        );

      case "experience":
        if (!profile.experience.length) return null;
        return (
          <section key={section}>
            {heading}
            <div className={compact ? "space-y-3" : "space-y-4"}>
              {profile.experience.map((item) => (
                <article key={item.id} className="break-inside-avoid">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-[11px] font-bold text-slate-900">
                        {item.jobTitle}
                      </h3>
                      <p className="text-[10px] font-medium text-slate-500">
                        {item.company}
                        {item.location ? ` · ${item.location}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 whitespace-nowrap text-[9px] text-slate-400">
                      {formatRange(item.startDate, item.endDate, item.isCurrent)}
                    </span>
                  </div>
                  {item.description && (
                    <p className="mt-1 text-[10px] leading-4 text-slate-600">
                      {renderFormattedText(item.description)}
                    </p>
                  )}
                  {item.achievements.filter(Boolean).length > 0 && (
                    <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[10px] leading-4 text-slate-600">
                      {item.achievements.filter(Boolean).map((achievement, idx) => (
                        <li key={`${item.id}-ach-${idx}`}>
                          {renderFormattedText(achievement)}
                        </li>
                      ))}
                    </ul>
                  )}
                  {item.technologies.length > 0 && (
                    <p
                      className="mt-1 text-[9px] font-medium"
                      style={{ color: settings.accentColor }}
                    >
                      {projectTechJoin(item.technologies)}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        );

      case "projects":
        if (!profile.projects.length) return null;
        return (
          <section key={section}>
            {heading}
            <div className="grid grid-cols-2 gap-2.5">
              {profile.projects.map((project) => {
                const hasLinks = Boolean(
                  project.url?.trim() || project.repositoryUrl?.trim()
                );
                return (
                  <article
                    key={project.id}
                    className="flex break-inside-avoid flex-col justify-between rounded-lg border border-slate-200/90 bg-slate-50/30 p-2.5"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1.5">
                        <h3 className="min-w-0 text-[10.5px] font-bold leading-snug text-slate-900">
                          {project.name}
                        </h3>
                        {hasLinks && (
                          <div className="flex shrink-0 items-center gap-1.5 text-[8.5px] font-semibold">
                            {project.url?.trim() && (
                              <a
                                href={normalizeHref(project.url)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-0.5 hover:underline"
                                style={{ color: settings.accentColor }}
                              >
                                <span>Live</span>
                                <ExternalLink className="size-2.5" />
                              </a>
                            )}
                            {project.repositoryUrl?.trim() && (
                              <a
                                href={normalizeHref(project.repositoryUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-0.5 text-slate-600 hover:text-slate-900 hover:underline"
                              >
                                <svg
                                  className="size-2.5 fill-current"
                                  viewBox="0 0 24 24"
                                  aria-hidden="true"
                                >
                                  <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
                                </svg>
                                <span>Code</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      {project.description && (
                        <p className="mt-1 text-[9.5px] leading-[1.45] text-slate-600">
                          {renderFormattedText(project.description)}
                        </p>
                      )}

                      {project.highlights.filter(Boolean).length > 0 && (
                        <ul className="mt-1 list-disc space-y-0.5 pl-3.5 text-[9.5px] leading-[1.4] text-slate-600">
                          {project.highlights.filter(Boolean).map((highlight, idx) => (
                            <li key={`${project.id}-hl-${idx}`}>
                              {renderFormattedText(highlight)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {project.technologies.length > 0 && (
                      <p
                        className="mt-2 text-[8.5px] font-medium"
                        style={{ color: settings.accentColor }}
                      >
                        {projectTechJoin(project.technologies)}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        );

      case "education":
        if (!profile.education.length) return null;
        return (
          <section key={section}>
            {heading}
            <div className={compact ? "space-y-2.5" : "space-y-3"}>
              {profile.education.map((item) => (
                <article
                  key={item.id}
                  className="flex items-start justify-between gap-3 break-inside-avoid"
                >
                  <div className="min-w-0">
                    <h3 className="text-[11px] font-bold text-slate-900">
                      {item.degree}
                    </h3>
                    <p className="text-[10px] text-slate-600">
                      {item.institution}
                      {item.location ? ` · ${item.location}` : ""}
                    </p>
                    {item.description && (
                      <p className="mt-0.5 text-[9.5px] leading-4 text-slate-600">
                        {renderFormattedText(item.description)}
                      </p>
                    )}
                    {item.achievements?.filter(Boolean).length ? (
                      <ul className="mt-0.5 list-disc pl-4 text-[9.5px] leading-4 text-slate-600">
                        {item.achievements.filter(Boolean).map((achievement, idx) => (
                          <li key={`${item.id}-edu-${idx}`}>
                            {renderFormattedText(achievement)}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <span className="shrink-0 whitespace-nowrap text-[9px] text-slate-400">
                    {formatRange(item.startDate, item.endDate, item.isCurrent)}
                  </span>
                </article>
              ))}
            </div>
          </section>
        );

      case "custom":
        return profile.customSections
          .filter((custom) => custom.items.length > 0)
          .map((custom) => (
            <section key={custom.id}>
              <h2
                className={`${compact ? "mb-2" : "mb-3"} text-[12px] font-bold uppercase tracking-[0.18em]`}
                style={{ color: settings.accentColor }}
              >
                {custom.title}
              </h2>
              <div className="space-y-2 text-[10px]">
                {custom.items.map((item) => (
                  <div key={item.id} className="break-inside-avoid">
                    <strong className="text-slate-900">{item.title}</strong>
                    <p className="text-slate-600">
                      {renderFormattedText(item.content)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ));

      default:
        return null;
    }
  };

  const sidebarSections = new Set<SectionKey>(["skills", "languages"]);
  const mainSections = orderedSections(profile).filter(
    (section) => !sidebarSections.has(section)
  );
  const sideSections = orderedSections(profile).filter((section) =>
    sidebarSections.has(section)
  );

  return (
    <article
      className={`cv-template print-page-modern relative m-0 grid h-[297mm] max-h-[297mm] min-h-[297mm] w-[210mm] grid-cols-[64mm_1fr] overflow-hidden bg-white p-0 shadow-lg print:m-0 print:h-[297mm] print:max-h-[297mm] print:w-[210mm] print:max-w-none print:overflow-hidden print:p-0 print:shadow-none ${className}`}
      style={{
        fontFamily: cvFontFamily(settings.fontFamily),
        fontSize: `${settings.fontSize}pt`,
      }}
    >
      {fitActive && (
        <span className="absolute right-3 top-3 z-10 rounded-full bg-slate-900/75 px-2.5 py-1 text-[9px] font-medium text-white print:hidden">
          Auto-fitted to 1 page ({fittedPercent}%)
        </span>
      )}

      {/* বাম সাইডবার */}
      <aside
        className={`w-[64mm] shrink-0 overflow-hidden text-white print:h-[297mm] print:min-h-[297mm] ${
          compact ? "p-5" : "p-6"
        }`}
        style={{ backgroundColor: settings.accentColor }}
      >
        <div
          ref={sidebarRef}
          className="origin-top-left"
          style={{
            width: `${100 / scaleFactor}%`,
            transform: `scale(${scaleFactor})`,
          }}
        >
          {personalInfo.photo && (
            <img
              src={personalInfo.photo}
              alt={personalInfo.fullName || ""}
              className={`${
                compact ? "mb-3 h-24 w-24" : "mb-5 h-28 w-28"
              } shrink-0 aspect-square border-4 border-white/30 object-cover ${
                personalInfo.photoShape === "circle"
                  ? "rounded-full"
                  : "rounded-xl"
              }`}
            />
          )}

          <h1 className="text-[21px] font-bold leading-tight">
            {personalInfo.fullName}
          </h1>
          {personalInfo.jobTitle && (
            <p className="mt-1.5 text-[11.5px] font-medium text-white/85">
              {personalInfo.jobTitle}
            </p>
          )}

          {sidebarContacts.length > 0 && (
            <div
              className={`${
                compact ? "mt-4 space-y-1.5" : "mt-6 space-y-2"
              } text-[9px] leading-4 text-white/90`}
            >
              {sidebarContacts.map((item) =>
                item.href ? (
                  <a
                    key={item.key}
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                    className="flex items-start gap-2 break-all text-white/90 transition hover:text-white hover:underline"
                  >
                    <span className="mt-0.5 text-white/75">{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                ) : (
                  <div
                    key={item.key}
                    className="flex items-start gap-2 break-words text-white/90"
                  >
                    <span className="mt-0.5 text-white/75">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                )
              )}
            </div>
          )}

          {sideSections.map((section) => {
            if (section === "skills") {
              const validSkills = (profile.skills ?? []).filter((s) =>
                s.name?.trim()
              );
              if (!validSkills.length) return null;
              return (
                <section key={section} className={compact ? "mt-5" : "mt-7"}>
                  <h2 className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                    {sectionTitle(section)}
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {validSkills.map((skill) => (
                      <span
                        key={skill.id}
                        className="rounded-full bg-white/15 px-2.5 py-0.5 text-[9px] font-medium text-white"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </section>
              );
            }

            if (section === "languages") {
              if (!profile.languages.length) return null;
              return (
                <section key={section} className={compact ? "mt-5" : "mt-7"}>
                  <h2 className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                    {sectionTitle(section)}
                  </h2>
                  <div className="space-y-1.5 text-[10px]">
                    {profile.languages.map((language) => (
                      <div
                        key={language.id}
                        className="flex items-baseline justify-between gap-2"
                      >
                        <span className="truncate">{language.language}</span>
                        <strong className="shrink-0 text-white/95">
                          {language.proficiency}
                        </strong>
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            return null;
          })}
        </div>
      </aside>

      {/* ডানপাশের মূল কলাম */}
      <main
        className={`min-w-0 overflow-hidden text-slate-900 ${
          compact ? "p-5" : "p-7"
        }`}
      >
        <div
          ref={mainRef}
          className={`origin-top-left ${compact ? "space-y-3.5" : "space-y-5"}`}
          style={{
            width: `${100 / scaleFactor}%`,
            transform: `scale(${scaleFactor})`,
          }}
        >
          {mainSections.flatMap(renderSection)}
        </div>
      </main>
    </article>
  );
}

function projectTechJoin(technologies: string[]): string {
  return technologies.filter(Boolean).join(" · ");
}
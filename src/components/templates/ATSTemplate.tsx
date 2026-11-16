import {
  cvFontFamily,
  formatRange,
  orderedSections,
  renderFormattedText,
  sectionTitle,
} from "@/components/templates/templateUtils";
import type { CVProfile, SectionKey } from "@/types/cv";
import { cn } from "@/lib/utils";

interface ATSTemplateProps {
  profile: CVProfile;
  className?: string;
}

function normalizeHref(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function cleanDisplayUrl(rawUrl: string): string {
  return rawUrl
    .trim()
    .replace(/^https?:\/\/(www\.)?/i, "")
    .replace(/\/$/, "");
}

function SectionHeading({ title }: { title: string }) {
  return (
    <h2 className="mb-2.5 border-b border-slate-900 pb-1 text-[11.5px] font-bold uppercase tracking-wider text-slate-950">
      {title}
    </h2>
  );
}

export function ATSTemplate({ profile, className = "" }: ATSTemplateProps) {
  const { personalInfo, settings } = profile;

  const headerLinks: Array<{ key: string; label: string; href?: string }> = [];

  if (personalInfo.email?.trim()) {
    const email = personalInfo.email.trim();
    headerLinks.push({ key: "email", label: email, href: `mailto:${email}` });
  }
  if (personalInfo.phone?.trim()) {
    const phone = personalInfo.phone.trim();
    headerLinks.push({
      key: "phone",
      label: phone,
      href: `tel:${phone.replace(/[^\d+]/g, "")}`,
    });
  }
  if (personalInfo.location?.trim()) {
    headerLinks.push({ key: "location", label: personalInfo.location.trim() });
  }
  if (personalInfo.website?.trim()) {
    const raw = personalInfo.website.trim();
    headerLinks.push({
      key: "website",
      label: cleanDisplayUrl(raw),
      href: normalizeHref(raw),
    });
  }
  if (personalInfo.portfolio?.trim()) {
    const raw = personalInfo.portfolio.trim();
    headerLinks.push({
      key: "portfolio",
      label: cleanDisplayUrl(raw),
      href: normalizeHref(raw),
    });
  }
  if (personalInfo.linkedin?.trim()) {
    const raw = personalInfo.linkedin.trim();
    const cleaned = cleanDisplayUrl(raw);
    headerLinks.push({
      key: "linkedin",
      label: cleaned.startsWith("linkedin.com")
        ? cleaned
        : `linkedin.com/in/${cleaned.replace(/^in\//i, "")}`,
      href: normalizeHref(
        raw.includes("linkedin.com") ? raw : `https://linkedin.com/in/${cleaned}`
      ),
    });
  }
  if (personalInfo.github?.trim()) {
    const raw = personalInfo.github.trim();
    const cleaned = cleanDisplayUrl(raw);
    headerLinks.push({
      key: "github",
      label: cleaned.startsWith("github.com")
        ? cleaned
        : `github.com/${cleaned}`,
      href: normalizeHref(
        raw.includes("github.com") ? raw : `https://github.com/${cleaned}`
      ),
    });
  }

  const renderSection = (section: SectionKey) => {
    switch (section) {
      case "summary":
        if (!personalInfo.summary?.trim()) return null;
        return (
          <section key={section} className="break-inside-avoid">
            <SectionHeading title={sectionTitle(section)} />
            <p className="text-[10px] leading-[1.55] text-slate-900">
              {renderFormattedText(personalInfo.summary)}
            </p>
          </section>
        );

      case "experience":
        if (!profile.experience.length) return null;
        return (
          <section key={section}>
            <SectionHeading title={sectionTitle(section)} />
            <div className="space-y-3.5">
              {profile.experience.map((item) => (
                <article key={item.id} className="break-inside-avoid">
                  <div className="flex items-baseline justify-between gap-3">
                    <div>
                      <h3 className="text-[11px] font-bold text-slate-950">
                        {item.jobTitle}
                      </h3>
                      <p className="text-[10px] font-medium text-slate-800">
                        {item.company}
                        {item.location ? ` — ${item.location}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 text-[9.5px] font-medium text-slate-700">
                      {formatRange(item.startDate, item.endDate, item.isCurrent)}
                    </span>
                  </div>

                  {item.description && (
                    <p className="mt-1 text-[10px] leading-[1.5] text-slate-900">
                      {renderFormattedText(item.description)}
                    </p>
                  )}

                  {item.achievements.filter(Boolean).length > 0 && (
                    <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[10px] leading-[1.5] text-slate-900">
                      {item.achievements.filter(Boolean).map((achievement, idx) => (
                        <li key={`${item.id}-ach-${idx}`}>
                          {renderFormattedText(achievement)}
                        </li>
                      ))}
                    </ul>
                  )}

                  {item.technologies.length > 0 && (
                    <p className="mt-1 text-[9.5px] text-slate-700">
                      <span className="font-semibold text-slate-900">
                        Technologies:{" "}
                      </span>
                      {item.technologies.join(", ")}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        );

      case "education":
        if (!profile.education.length) return null;
        return (
          <section key={section}>
            <SectionHeading title={sectionTitle(section)} />
            <div className="space-y-3">
              {profile.education.map((item) => (
                <article
                  key={item.id}
                  className="flex items-baseline justify-between gap-3 break-inside-avoid"
                >
                  <div className="min-w-0">
                    <h3 className="text-[11px] font-bold text-slate-950">
                      {item.degree}
                    </h3>
                    <p className="text-[10px] text-slate-800">
                      {item.institution}
                      {item.location ? `, ${item.location}` : ""}
                    </p>
                    {item.description && (
                      <p className="mt-1 text-[10px] leading-[1.5] text-slate-900">
                        {renderFormattedText(item.description)}
                      </p>
                    )}
                    {item.achievements?.filter(Boolean).length ? (
                      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[10px] leading-[1.5] text-slate-900">
                        {item.achievements.filter(Boolean).map((achievement, idx) => (
                          <li key={`${item.id}-edu-${idx}`}>
                            {renderFormattedText(achievement)}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-[9.5px] font-medium text-slate-700">
                    {formatRange(item.startDate, item.endDate, item.isCurrent)}
                  </span>
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

        const hasCategories = validSkills.some((s) => s.category?.trim());

        if (!hasCategories) {
          return (
            <section key={section} className="break-inside-avoid">
              <SectionHeading title={sectionTitle(section)} />
              <p className="text-[10px] leading-[1.55] text-slate-900">
                {validSkills
                  .map((s) =>
                    s.yearsOfExperience
                      ? `${s.name.trim()} (${s.yearsOfExperience} yrs)`
                      : s.name.trim()
                  )
                  .join("  |  ")}
              </p>
            </section>
          );
        }

        const groups: Record<string, string[]> = {};
        for (const skill of validSkills) {
          const cat = skill.category?.trim() || "Additional";
          if (!groups[cat]) groups[cat] = [];
          groups[cat].push(
            skill.yearsOfExperience
              ? `${skill.name.trim()} (${skill.yearsOfExperience}y)`
              : skill.name.trim()
          );
        }

        return (
          <section key={section} className="break-inside-avoid">
            <SectionHeading title={sectionTitle(section)} />
            <div className="space-y-1 text-[10px] leading-[1.55] text-slate-900">
              {Object.entries(groups).map(([category, skills]) => (
                <p key={category}>
                  <strong className="font-semibold text-slate-950">
                    {category}:{" "}
                  </strong>
                  <span>{skills.join(", ")}</span>
                </p>
              ))}
            </div>
          </section>
        );
      }

      case "projects":
        if (!profile.projects.length) return null;
        return (
          <section key={section}>
            <SectionHeading title={sectionTitle(section)} />
            <div className="space-y-3">
              {profile.projects.map((project) => {
                const hasDate = Boolean(project.startDate || project.endDate);
                return (
                  <article key={project.id} className="break-inside-avoid">
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <h3 className="text-[11px] font-bold text-slate-950">
                          {project.name}
                        </h3>
                        {(project.url?.trim() || project.repositoryUrl?.trim()) && (
                          <span className="text-[9.5px] text-slate-700">
                            (
                            {[
                              project.url?.trim() && (
                                <a
                                  key="live"
                                  href={normalizeHref(project.url)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="underline"
                                >
                                  Live: {cleanDisplayUrl(project.url)}
                                </a>
                              ),
                              project.repositoryUrl?.trim() && (
                                <a
                                  key="repo"
                                  href={normalizeHref(project.repositoryUrl)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="underline"
                                >
                                  GitHub: {cleanDisplayUrl(project.repositoryUrl)}
                                </a>
                              ),
                            ]
                              .filter(Boolean)
                              .reduce<React.ReactNode[]>(
                                (acc, curr, idx) =>
                                  idx === 0 ? [curr] : [...acc, " | ", curr],
                                []
                              )}
                            )
                          </span>
                        )}
                      </div>
                      {hasDate && (
                        <span className="shrink-0 text-[9.5px] font-medium text-slate-700">
                          {formatRange(
                            project.startDate ?? "",
                            project.endDate,
                            false
                          )}
                        </span>
                      )}
                    </div>

                    {project.description && (
                      <p className="mt-1 text-[10px] leading-[1.5] text-slate-900">
                        {renderFormattedText(project.description)}
                      </p>
                    )}

                    {project.highlights.filter(Boolean).length > 0 && (
                      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[10px] leading-[1.5] text-slate-900">
                        {project.highlights.filter(Boolean).map((highlight, idx) => (
                          <li key={`${project.id}-hl-${idx}`}>
                            {renderFormattedText(highlight)}
                          </li>
                        ))}
                      </ul>
                    )}

                    {project.technologies.length > 0 && (
                      <p className="mt-1 text-[9.5px] text-slate-700">
                        <span className="font-semibold text-slate-900">
                          Technologies:{" "}
                        </span>
                        {project.technologies.join(", ")}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        );

      case "languages":
        if (!profile.languages.length) return null;
        return (
          <section key={section} className="break-inside-avoid">
            <SectionHeading title={sectionTitle(section)} />
            <p className="text-[10px] leading-[1.55] text-slate-900">
              {profile.languages
                .map((lang) =>
                  lang.certification
                    ? `${lang.language} (${lang.proficiency} — ${lang.certification})`
                    : `${lang.language} (${lang.proficiency})`
                )
                .join("  |  ")}
            </p>
          </section>
        );

      case "custom":
        return profile.customSections
          .filter((custom) => custom.items.length > 0)
          .map((custom) => (
            <section key={custom.id}>
              <SectionHeading title={custom.title} />
              <div className="space-y-1.5 text-[10px] leading-[1.55] text-slate-900">
                {custom.items.map((item) => (
                  <p key={item.id} className="break-inside-avoid">
                    <strong className="font-semibold text-slate-950">
                      {item.title}:{" "}
                    </strong>
                    {renderFormattedText(item.content)}
                  </p>
                ))}
              </div>
            </section>
          ));
    }
  };

  return (
    <article
      className={cn(
        "cv-template mx-auto min-h-[297mm] w-[210mm] bg-white p-6 text-slate-950 shadow-lg print:w-full print:p-0 print:shadow-none",
        className
      )}
      style={{
        fontFamily: cvFontFamily(settings.fontFamily),
        fontSize: `${settings.fontSize}pt`,
      }}
    >
      <header className="mb-6 border-b-2 border-slate-950 pb-4 text-center">
        <h1 className="text-[24px] font-bold uppercase tracking-tight text-slate-950">
          {personalInfo.fullName}
        </h1>
        {personalInfo.jobTitle && (
          <p className="mt-1 text-[12.5px] font-semibold text-slate-800">
            {personalInfo.jobTitle}
          </p>
        )}
        {headerLinks.length > 0 && (
          <p className="mt-2.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[9.5px] text-slate-800">
            {headerLinks.map((item, idx) => (
              <span key={item.key} className="inline-flex items-center">
                {idx > 0 && <span className="mr-2 text-slate-400">|</span>}
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                    className="hover:underline"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span>{item.label}</span>
                )}
              </span>
            ))}
          </p>
        )}
      </header>

      <div className="space-y-4.5">
        {orderedSections(profile).flatMap(renderSection)}
      </div>
    </article>
  );
}
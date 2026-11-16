"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eraser,
  Plus,
  SearchCheck,
  Sparkles,
  X,
} from "lucide-react";
import { matchJobDescription } from "@/lib/atsMatcher";
import { useCV } from "@/context/CVContext";
import { cn } from "@/lib/utils";

interface ATSMatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ATSMatcherModal({ isOpen, onClose }: ATSMatcherModalProps) {
  const { activeCV, updateActiveCV } = useCV();
  const [jobDescription, setJobDescription] = useState("");
  const [recentlyAdded, setRecentlyAdded] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const result = useMemo(
    () =>
      activeCV && jobDescription.trim()
        ? matchJobDescription(jobDescription, activeCV)
        : null,
    [activeCV, jobDescription]
  );

  if (!isOpen) return null;

  const handleAddSkillToCV = (keyword: string) => {
    if (!activeCV) return;
    const exists = activeCV.skills.some(
      (s) => s.name.toLowerCase() === keyword.toLowerCase()
    );
    if (exists) return;

    const newSkill = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: keyword,
    };

    updateActiveCV({
      skills: [...activeCV.skills, newSkill],
    });

    setRecentlyAdded((prev) => [...prev, keyword]);
  };

  const getScoreMeta = (score: number) => {
    if (score >= 75) {
      return {
        label: "Strong ATS Match",
        hint: "Your CV aligns well with the core requirements of this role.",
        textClass: "text-emerald-600",
        barClass: "bg-emerald-500",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    }
    if (score >= 45) {
      return {
        label: "Moderate Match",
        hint: "Click any missing keyword below to add it directly to your Skills.",
        textClass: "text-amber-600",
        barClass: "bg-amber-500",
        badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
      };
    }
    return {
      label: "Low Match",
      hint: "Tailor your summary, experience, and skills using the missing keywords.",
      textClass: "text-rose-600",
      barClass: "bg-rose-500",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    };
  };

  const scoreMeta = result ? getScoreMeta(result.score) : null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ats-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        {/* হেডার */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <SearchCheck className="size-5" />
            </div>
            <div>
              <h2
                id="ats-modal-title"
                className="text-base font-bold text-slate-900"
              >
                ATS Keyword Matcher
              </h2>
              <p className="text-xs text-slate-500">
                Compare your active CV against a target job description.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close ATS matcher"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* বডি */}
        <div className="space-y-5 overflow-y-auto p-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="jd-input"
                className="text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Job Description
              </label>
              {jobDescription.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    setJobDescription("");
                    setRecentlyAdded([]);
                  }}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                >
                  <Eraser className="size-3" />
                  Clear
                </button>
              )}
            </div>
            <textarea
              id="jd-input"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Paste the full job description (responsibilities, skills, qualifications) here..."
              className="min-h-36 w-full resize-y rounded-xl border border-slate-200 bg-slate-50/40 p-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          {!activeCV && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
              <AlertCircle className="size-4 shrink-0" />
              <span>Create or select a CV profile before running an ATS match.</span>
            </div>
          )}

          {result && scoreMeta && (
            <div className="space-y-5">
              {/* স্কোর কার্ড ও প্রোগ্রেস বার */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        Match Score
                      </span>
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                          scoreMeta.badgeClass
                        )}
                      >
                        {scoreMeta.label}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {scoreMeta.hint}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-3xl font-extrabold tabular-nums",
                      scoreMeta.textClass
                    )}
                  >
                    {result.score}%
                  </span>
                </div>

                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200/80">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      scoreMeta.barClass
                    )}
                    style={{ width: `${Math.min(100, Math.max(4, result.score))}%` }}
                  />
                </div>
              </div>

              {/* মিসিং কিওয়ার্ডস (১-ক্লিকে সিভিতে যোগ করার সুবিধাসহ) */}
              <section className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <Sparkles className="size-3.5 text-amber-500" />
                    Missing Keywords{" "}
                    <span className="font-normal text-slate-400">
                      ({result.missingKeywords.length})
                    </span>
                  </h3>
                  {result.missingKeywords.length > 0 && (
                    <span className="text-[11px] text-slate-400">
                      Click to add to Skills
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {result.missingKeywords.length ? (
                    result.missingKeywords.map((keyword) => (
                      <button
                        key={keyword}
                        type="button"
                        onClick={() => handleAddSkillToCV(keyword)}
                        title={`Add "${keyword}" to CV skills`}
                        className="group inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50/80 px-2.5 py-1 text-xs font-medium text-amber-900 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        <Plus className="size-3 text-amber-600 transition group-hover:text-indigo-600" />
                        <span>{keyword}</span>
                      </button>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">
                      Great job! No major keywords missing.
                    </span>
                  )}
                </div>
              </section>

              {/* ম্যাচড কিওয়ার্ডস */}
              <section className="space-y-2.5">
                <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  Matched Keywords{" "}
                  <span className="font-normal text-slate-400">
                    ({result.matchedKeywords.length})
                  </span>
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {result.matchedKeywords.length ? (
                    result.matchedKeywords.map((keyword) => {
                      const justAdded = recentlyAdded.includes(keyword);
                      return (
                        <span
                          key={keyword}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
                            justAdded
                              ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                              : "border-emerald-200/80 bg-emerald-50 text-emerald-700"
                          )}
                        >
                          {keyword}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-xs text-slate-500">
                      No keywords matched yet.
                    </span>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
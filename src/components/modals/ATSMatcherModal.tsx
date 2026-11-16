"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { matchJobDescription } from "@/lib/atsMatcher";
import { useCV } from "@/context/CVContext";
import { cn } from "@/lib/utils";

interface ATSMatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ATSMatcherModal({ isOpen, onClose }: ATSMatcherModalProps) {
  const { activeCV } = useCV();
  const [jobDescription, setJobDescription] = useState("");
  const result = useMemo(
    () => (activeCV && jobDescription.trim() ? matchJobDescription(jobDescription, activeCV) : null),
    [activeCV, jobDescription],
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-4" role="dialog" aria-modal="true" aria-labelledby="ats-modal-title">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="ats-modal-title" className="text-lg font-semibold text-zinc-950">ATS Keyword Matcher</h2>
            <p className="mt-1 text-sm text-zinc-500">Paste a job description to compare it with your active CV.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close ATS matcher" className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"><X className="size-5" /></button>
        </div>
        <textarea
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          placeholder="Paste the full job description here..."
          className="mt-5 min-h-40 w-full resize-y rounded-xl border border-zinc-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        {result && (
          <div className="mt-5 space-y-5">
            <div className="flex items-center justify-between rounded-xl bg-zinc-50 p-4">
              <span className="font-medium text-zinc-700">Match Score</span>
              <span className={cn("text-3xl font-bold", result.score >= 70 ? "text-emerald-600" : result.score >= 40 ? "text-amber-600" : "text-red-600")}>{result.score}%</span>
            </div>
            <KeywordGroup title="Matched Keywords" keywords={result.matchedKeywords} className="bg-emerald-50 text-emerald-700" />
            <KeywordGroup title="Missing Keywords" keywords={result.missingKeywords} className="bg-amber-50 text-amber-800" />
          </div>
        )}
        {!activeCV && <p className="mt-4 text-sm text-red-600">Create or select a CV profile before running a match.</p>}
      </div>
    </div>
  );
}

function KeywordGroup({ title, keywords, className }: { title: string; keywords: string[]; className: string }) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold text-zinc-800">{title} <span className="font-normal text-zinc-400">({keywords.length})</span></h3>
      <div className="flex flex-wrap gap-2">
        {keywords.length ? keywords.map((keyword) => <span key={keyword} className={cn("rounded-full px-2.5 py-1 text-xs font-medium", className)}>{keyword}</span>) : <span className="text-sm text-zinc-500">None</span>}
      </div>
    </section>
  );
}

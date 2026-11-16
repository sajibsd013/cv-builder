"use client";

import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileDown,
  FilePlus2,
  FileUp,
  MoreVertical,
  Pencil,
  SearchCheck,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useCV } from "@/context/CVContext";
import { ATSMatcherModal } from "@/components/modals/ATSMatcherModal";
import { cn } from "@/lib/utils";

function ActionTooltip({
  label,
  align = "center",
  children,
}: {
  label: string;
  align?: "center" | "right";
  children: ReactNode;
}) {
  return (
    <div className="group relative flex items-center">
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute top-full z-50 mt-2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-md transition-all duration-150 group-hover:translate-y-0.5 group-hover:opacity-100",
          align === "right" ? "right-0" : "left-1/2 -translate-x-1/2"
        )}
      >
        {label}
      </span>
    </div>
  );
}

export function Navbar({
  onDownloadPDF,
  className,
}: {
  onDownloadPDF: () => Promise<void>;
  className?: string;
}) {
  const {
    profiles,
    activeCV,
    activeProfileId,
    autoSaveStatus,
    createProfile,
    duplicateProfile,
    deleteProfile,
    switchProfile,
    updateActiveCV,
    loadSampleData,
    exportAsJSON,
    importFromJSON,
  } = useCV();

  const importRef = useRef<HTMLInputElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const [isATSOpen, setIsATSOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const showToast = (msg: string) => setToastMessage(msg);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2800);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    if (!isDeleteModalOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsDeleteModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDeleteModalOpen]);

  useEffect(() => {
    if (!isMoreOpen) return;
    const handleOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isMoreOpen]);

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setImportError(null);
      await importFromJSON(file);
      setIsMoreOpen(false);
      showToast("CV backup imported successfully");
    } catch (error) {
      setImportError(
        error instanceof Error ? error.message : "Unable to import this file."
      );
    }
  };

  const handleCreate = () => {
    createProfile();
    showToast("New CV profile created");
  };

  const handleDuplicate = () => {
    if (!activeCV) return;
    const sourceName = activeCV.name;
    duplicateProfile();
    showToast(`Duplicated "${sourceName}"`);
  };

  const handleLoadSample = () => {
    loadSampleData();
    showToast("Sample CV data loaded");
  };

  const startRename = () => {
    if (!activeCV) return;
    setRenameValue(activeCV.name);
    setIsRenaming(true);
  };

  const commitRename = () => {
    if (activeCV && renameValue.trim()) {
      const nextName = renameValue.trim();
      updateActiveCV({ name: nextName });
      showToast(`Renamed to "${nextName}"`);
    }
    setIsRenaming(false);
  };

  const confirmDeleteProfile = () => {
    if (!activeCV) return;
    const deletedName = activeCV.name;
    deleteProfile();
    setIsDeleteModalOpen(false);
    showToast(`Deleted "${deletedName}"`);
  };

  const handleDownload = async () => {
    if (!activeCV || isDownloading) return;
    setIsDownloading(true);
    try {
      await onDownloadPDF();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <header
        className={cn(
          "navbar sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md print:hidden",
          className
        )}
      >
        {/* ওয়াইড স্ক্রিনে অতিরিক্ত গ্যাপ ব্যালেন্স করার জন্য রেসপনসিভ কনটেইনার */}
        <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center justify-between gap-4 px-4 lg:px-6">
          {/* বামপাশ: ব্র্যান্ড ও অটো-সেভ স্ট্যাটাস */}
          <div className="flex min-w-0 shrink-0 items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-xs font-black text-white shadow-xs">
              CV
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold tracking-tight text-slate-900">
                Creativise CV Builder
              </h1>
              <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    autoSaveStatus === "saving"
                      ? "animate-pulse bg-amber-400"
                      : "bg-emerald-500"
                  )}
                />
                {autoSaveStatus === "saving" ? "Saving..." : "Saved locally"}
              </p>
            </div>
          </div>

          {/* ডেস্কটপ ভিউ: সব অপশন সরাসরি ভিজিবল + ফিট-কন্টেন্ট প্রোফাইল সিলেক্টর */}
          <div className="hidden min-w-0 items-center justify-end gap-2.5 lg:flex">
            {/* প্রোফাইল সিলেক্টর (ফুল নাম দেখানোর জন্য ফিট-উইডথ) অথবা ইনলাইন রিনেম */}
            {isRenaming ? (
              <div className="flex h-9 items-center gap-1 rounded-lg border border-indigo-400 bg-white px-2 ring-2 ring-indigo-500/15">
                <input
                  type="text"
                  autoFocus
                  aria-label="New CV profile name"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename();
                    if (e.key === "Escape") setIsRenaming(false);
                  }}
                  className="w-48 bg-transparent px-1 text-xs font-medium text-slate-900 outline-none"
                />
                <button
                  type="button"
                  onClick={commitRename}
                  aria-label="Confirm rename"
                  className="flex size-6 items-center justify-center rounded bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  <Check className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsRenaming(false)}
                  aria-label="Cancel rename"
                  className="flex size-6 items-center justify-center rounded text-slate-500 hover:bg-slate-100"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ) : (
              <ActionTooltip label="Switch active CV profile">
                <select
                  aria-label="Active CV profile"
                  value={activeProfileId ?? ""}
                  onChange={(event) => switchProfile(event.target.value)}
                  className="h-9 w-auto min-w-[140px] max-w-[320px] cursor-pointer rounded-lg border border-slate-200 bg-slate-50/70 px-3 text-xs font-semibold text-slate-800 outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:bg-white"
                >
                  {!profiles.length && <option value="">No profiles</option>}
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name}
                    </option>
                  ))}
                </select>
              </ActionTooltip>
            )}

            {/* প্রোফাইল ম্যানেজমেন্ট বাটন গ্রুপ */}
            <div className="flex h-9 shrink-0 items-center divide-x divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-2xs">
              <ActionTooltip label="Create new CV">
                <button
                  type="button"
                  onClick={handleCreate}
                  aria-label="New profile"
                  className="flex h-full items-center px-2.5 text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"
                >
                  <FilePlus2 className="size-4" />
                </button>
              </ActionTooltip>

              <ActionTooltip label="Duplicate current CV">
                <button
                  type="button"
                  onClick={handleDuplicate}
                  disabled={!activeCV}
                  aria-label="Duplicate profile"
                  className="flex h-full items-center px-2.5 text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600 disabled:pointer-events-none disabled:opacity-40"
                >
                  <Copy className="size-4" />
                </button>
              </ActionTooltip>

              <ActionTooltip label="Rename CV">
                <button
                  type="button"
                  onClick={startRename}
                  disabled={!activeCV || isRenaming}
                  aria-label="Rename profile"
                  className="flex h-full items-center px-2.5 text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600 disabled:pointer-events-none disabled:opacity-40"
                >
                  <Pencil className="size-4" />
                </button>
              </ActionTooltip>

              <ActionTooltip label="Delete CV">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  disabled={!activeCV}
                  aria-label="Delete profile"
                  className="flex h-full items-center px-2.5 text-rose-500 transition hover:bg-rose-50 hover:text-rose-600 disabled:pointer-events-none disabled:opacity-40"
                >
                  <Trash2 className="size-4" />
                </button>
              </ActionTooltip>
            </div>

            {/* স্পষ্ট অ্যাকশন লেবেল: Load Sample */}
            <ActionTooltip label="Populate editor with ready-made sample CV">
              <button
                type="button"
                onClick={handleLoadSample}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-amber-200 hover:bg-amber-50/70 hover:text-amber-700"
              >
                <Sparkles className="size-3.5 text-amber-500" />
                Load Sample
              </button>
            </ActionTooltip>

            {/* JSON ইমপোর্ট / এক্সপোর্ট গ্রুপ */}
            <input
              ref={importRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleImport}
            />
            <div className="flex h-9 shrink-0 items-center divide-x divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-2xs">
              <ActionTooltip label="Import JSON backup">
                <button
                  type="button"
                  onClick={() => importRef.current?.click()}
                  aria-label="Import JSON"
                  className="flex h-full items-center px-2.5 text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"
                >
                  <FileUp className="size-4" />
                </button>
              </ActionTooltip>

              <ActionTooltip label="Export JSON backup">
                <button
                  type="button"
                  onClick={() => {
                    exportAsJSON();
                    showToast("CV exported as JSON");
                  }}
                  disabled={!activeCV}
                  aria-label="Export JSON"
                  className="flex h-full items-center px-2.5 text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600 disabled:pointer-events-none disabled:opacity-40"
                >
                  <FileDown className="size-4" />
                </button>
              </ActionTooltip>
            </div>

            <span className="h-5 w-px shrink-0 bg-slate-200" />

            {/* ATS Check */}
            <ActionTooltip
              label="Compare CV keywords with job description"
              align="right"
            >
              <button
                type="button"
                onClick={() => setIsATSOpen(true)}
                disabled={!activeCV}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/50 px-3 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100/70 disabled:opacity-40"
              >
                <SearchCheck className="size-4" />
                ATS Check
              </button>
            </ActionTooltip>

            {/* Download PDF */}
            <ActionTooltip label="Save or print as A4 PDF" align="right">
              <button
                type="button"
                onClick={handleDownload}
                disabled={!activeCV || isDownloading}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 text-xs font-semibold text-white shadow-xs transition hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40"
              >
                <Download className="size-4" />
                {isDownloading ? "Preparing..." : "Download PDF"}
              </button>
            </ActionTooltip>
          </div>

          {/* মোবাইল ও ট্যাবলেট ভিউ */}
          <div className="flex min-w-0 items-center gap-1.5 lg:hidden">
            <label
              title="Switch active CV profile"
              className="relative flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600"
            >
              <UserRound className="size-4" aria-hidden="true" />
              <select
                aria-label="Active CV profile"
                value={activeProfileId ?? ""}
                onChange={(event) => switchProfile(event.target.value)}
                className="absolute size-9 cursor-pointer opacity-0"
              >
                {!profiles.length && <option value="">No profiles</option>}
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </select>
            </label>

            <div ref={mobileMenuRef} className="relative">
              <button
                type="button"
                aria-label="Open more actions"
                onClick={() => setIsMoreOpen((open) => !open)}
                className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <MoreVertical className="size-4" />
              </button>
              {isMoreOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      handleCreate();
                      setIsMoreOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <FilePlus2 className="size-3.5 text-indigo-600" />
                    New CV Profile
                  </button>
                  <button
                    type="button"
                    disabled={!activeCV}
                    onClick={() => {
                      handleDuplicate();
                      setIsMoreOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <Copy className="size-3.5 text-slate-500" />
                    Duplicate CV
                  </button>
                  <button
                    type="button"
                    disabled={!activeCV}
                    onClick={() => {
                      if (activeCV) {
                        const next = window.prompt(
                          "Rename CV profile",
                          activeCV.name
                        );
                        if (next?.trim()) {
                          updateActiveCV({ name: next.trim() });
                          showToast(`Renamed to "${next.trim()}"`);
                        }
                      }
                      setIsMoreOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <Pencil className="size-3.5 text-slate-500" />
                    Rename CV
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    type="button"
                    onClick={() => {
                      handleLoadSample();
                      setIsMoreOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Sparkles className="size-3.5 text-amber-500" />
                    Load Sample
                  </button>
                  <button
                    type="button"
                    disabled={!activeCV}
                    onClick={() => {
                      setIsATSOpen(true);
                      setIsMoreOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <SearchCheck className="size-3.5 text-indigo-600" />
                    ATS Check
                  </button>
                  <button
                    type="button"
                    onClick={() => importRef.current?.click()}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <FileUp className="size-3.5 text-slate-500" />
                    Import JSON
                  </button>
                  <button
                    type="button"
                    disabled={!activeCV}
                    onClick={() => {
                      exportAsJSON();
                      setIsMoreOpen(false);
                      showToast("CV exported as JSON");
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <FileDown className="size-3.5 text-slate-500" />
                    Export JSON
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    type="button"
                    disabled={!activeCV}
                    onClick={() => {
                      setIsMoreOpen(false);
                      setIsDeleteModalOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-40"
                  >
                    <Trash2 className="size-3.5" />
                    Delete CV
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleDownload}
              disabled={!activeCV || isDownloading}
              aria-label="Download PDF"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 text-xs font-semibold text-white shadow-xs disabled:opacity-40"
            >
              <Download className="size-3.5" />
              {isDownloading ? "..." : "PDF"}
            </button>
          </div>
        </div>
      </header>

      {/* ইম্পোর্ট এরর ব্যানার */}
      {importError && (
        <div
          role="alert"
          className="flex items-center justify-between border-b border-rose-200 bg-rose-50 px-4 py-2 text-xs font-medium text-rose-700 print:hidden"
        >
          <span>{importError}</span>
          <button
            type="button"
            onClick={() => setImportError(null)}
            aria-label="Dismiss error"
            className="rounded p-0.5 hover:bg-rose-100"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* অ্যাকশন ফিডব্যাক টোস্ট */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs font-medium text-white shadow-xl print:hidden"
        >
          <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss notification"
            className="ml-1 rounded p-0.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* কাস্টম ডিলিট কনফার্মেশন মডাল */}
      {isDeleteModalOpen && activeCV && (
        <div
          onClick={() => setIsDeleteModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs print:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-cv-modal-title"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start gap-3.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <AlertTriangle className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2
                  id="delete-cv-modal-title"
                  className="text-base font-bold text-slate-900"
                >
                  Delete CV Profile?
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                  Are you sure you want to permanently delete{" "}
                  <span className="font-semibold text-slate-900">
                    “{activeCV.name}”
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="inline-flex h-9 items-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteProfile}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-600 px-4 text-xs font-semibold text-white shadow-xs transition hover:bg-rose-700"
              >
                <Trash2 className="size-3.5" />
                Delete Profile
              </button>
            </div>
          </div>
        </div>
      )}

      <ATSMatcherModal isOpen={isATSOpen} onClose={() => setIsATSOpen(false)} />
    </>
  );
}
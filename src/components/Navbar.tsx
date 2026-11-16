"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Download, FileDown, FileUp, FilePlus2, SearchCheck, Copy, Pencil, Trash2, MoreVertical, UserRound } from "lucide-react";
import { useCV } from "@/context/CVContext";
import { ATSMatcherModal } from "@/components/modals/ATSMatcherModal";
import { cn } from "@/lib/utils";

export function Navbar({ onDownloadPDF, className }: { onDownloadPDF: () => Promise<void>; className?: string }) {
  const { profiles, activeCV, activeProfileId, autoSaveStatus, createProfile, duplicateProfile, deleteProfile, switchProfile, updateActiveCV, loadSampleData, exportAsJSON, importFromJSON } = useCV();
  const importRef = useRef<HTMLInputElement>(null);
  const [isATSOpen, setIsATSOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setImportError(null);
      await importFromJSON(file);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Unable to import this file.");
    }
  };

  const rename = () => {
    if (!activeCV) return;
    const name = window.prompt("Rename CV profile", activeCV.name);
    if (name?.trim()) updateActiveCV({ name: name.trim() });
  };

  const remove = () => {
    if (activeCV && window.confirm(`Delete "${activeCV.name}"?`)) deleteProfile();
  };

  return (
    <>
      <header className={cn("navbar sticky top-0 z-40 flex h-14 min-w-0 flex-wrap items-center gap-3 overflow-visible border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md", className)}>
        <div className="mr-auto flex min-w-0 items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-black text-white shadow-sm">CV</div>
          <div className="min-w-0"><h1 className="truncate text-sm font-bold tracking-tight text-slate-950">Creativise CV Builder</h1><p className="flex items-center gap-1.5 text-[11px] text-slate-500"><span className={cn("size-1.5 shrink-0 rounded-full", autoSaveStatus === "saving" ? "bg-amber-400" : "bg-emerald-500")} />{autoSaveStatus === "saving" ? "Saving..." : "Saved locally"}</p></div>
        </div>
        <div className="hidden min-w-0 flex-wrap items-center justify-end gap-2 lg:flex">
          <select aria-label="Active CV profile" value={activeProfileId ?? ""} onChange={(event) => switchProfile(event.target.value)} className="max-w-44 rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-sm text-zinc-700 outline-none focus:border-blue-500">
            {!profiles.length && <option value="">No profiles</option>}
            {profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
          </select>
          <div className="flex items-center rounded-lg border border-zinc-200">
            <button type="button" onClick={() => createProfile()} title="New profile" className="p-2 text-zinc-600 hover:bg-zinc-50"><FilePlus2 className="size-4" /></button>
            <button type="button" onClick={() => duplicateProfile()} disabled={!activeCV} title="Duplicate profile" className="border-l border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-50 disabled:opacity-40"><Copy className="size-4" /></button>
            <button type="button" onClick={rename} disabled={!activeCV} title="Rename profile" className="border-l border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-50 disabled:opacity-40"><Pencil className="size-4" /></button>
            <button type="button" onClick={remove} disabled={!activeCV} title="Delete profile" className="border-l border-zinc-200 p-2 text-red-500 hover:bg-red-50 disabled:opacity-40"><Trash2 className="size-4" /></button>
          </div>
          <button type="button" onClick={loadSampleData} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">Load Sample</button>
          <input ref={importRef} type="file" accept=".json,application/json" className="hidden" onChange={handleImport} />
          <div className="flex items-center rounded-lg border border-zinc-200">
            <button type="button" onClick={() => importRef.current?.click()} title="Import JSON" className="p-2 text-zinc-600 hover:bg-zinc-50"><FileUp className="size-4" /></button>
            <button type="button" onClick={exportAsJSON} disabled={!activeCV} title="Export JSON" className="border-l border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-50 disabled:opacity-40"><FileDown className="size-4" /></button>
          </div>
          <button type="button" onClick={() => setIsATSOpen(true)} disabled={!activeCV} className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-40"><SearchCheck className="size-4" /> ATS Check</button>
          <button type="button" onClick={onDownloadPDF} disabled={!activeCV} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40"><Download className="size-4" /> Download PDF</button>
          {importError && <p role="alert" className="basis-full text-right text-xs text-red-600">{importError}</p>}
        </div>
        <div className="flex min-w-0 items-center gap-1 lg:hidden">
          <label className="relative flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600">
            <UserRound className="size-4" aria-hidden="true" />
            <select aria-label="Active CV profile" value={activeProfileId ?? ""} onChange={(event) => switchProfile(event.target.value)} className="absolute size-9 cursor-pointer opacity-0">
              {!profiles.length && <option value="">No profiles</option>}
              {profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
            </select>
          </label>
          <div className="relative">
            <button type="button" aria-label="Open more actions" onClick={() => setIsMoreOpen((open) => !open)} className="flex size-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50">
              <MoreVertical className="size-4" />
            </button>
            {isMoreOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                <button type="button" onClick={() => { loadSampleData(); setIsMoreOpen(false); }} className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50">Load Sample</button>
                <button type="button" disabled={!activeCV} onClick={() => { setIsATSOpen(true); setIsMoreOpen(false); }} className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40">ATS Check</button>
                <button type="button" onClick={() => importRef.current?.click()} className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50">Import JSON</button>
                <button type="button" disabled={!activeCV} onClick={() => { exportAsJSON(); setIsMoreOpen(false); }} className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40">Export JSON</button>
              </div>
            )}
          </div>
          <button type="button" onClick={onDownloadPDF} disabled={!activeCV} aria-label="Download PDF" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-3 text-xs font-semibold text-white shadow-sm disabled:opacity-40"><Download className="size-3.5" />PDF</button>
        </div>
      </header>
      <ATSMatcherModal isOpen={isATSOpen} onClose={() => setIsATSOpen(false)} />
    </>
  );
}

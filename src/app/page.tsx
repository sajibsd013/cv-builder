"use client";

import { useState } from "react";
import { EditorPanel } from "@/components/editor/EditorPanel";
import { Navbar } from "@/components/Navbar";
import { PreviewPanel } from "@/components/preview/PreviewPanel";
import { useCV } from "@/context/CVContext";
import { exportCVToPDF } from "@/lib/exportPdf";
import { cn } from "@/lib/utils";

type MobileView = "editor" | "preview";

export default function Home() {
  const [mobileView, setMobileView] = useState<MobileView>("editor");
  const { activeCV } = useCV();

  const downloadPDF = async () => {
    if (!activeCV) return;
    exportCVToPDF(activeCV);
  };

  return (
    <main className="flex min-h-screen min-w-0 flex-col overflow-x-hidden bg-zinc-100">
      <Navbar onDownloadPDF={downloadPDF} />
      <div className="mobile-view-toggle sticky top-14 z-30 border-b border-zinc-200 bg-white/95 p-2 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex min-w-0 max-w-sm rounded-lg bg-zinc-100 p-1">
          {(["editor", "preview"] as const).map((view) => (
            <button key={view} type="button" onClick={() => setMobileView(view)} className={cn("min-w-0 flex-1 rounded-md px-3 py-2 text-sm font-semibold capitalize", mobileView === view ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500")}>{view === "preview" ? "Preview CV" : "Edit CV"}</button>
          ))}
        </div>
      </div>
      <div className="flex h-[calc(100dvh-6.5rem)] min-h-0 min-w-0 flex-1 flex-col lg:grid lg:h-[calc(100dvh-3.5rem)] lg:grid-cols-12 lg:flex-none">
        <EditorPanel className={cn("min-w-0 overflow-y-auto lg:col-span-5", mobileView !== "editor" && "hidden lg:flex")} />
        <PreviewPanel className={cn("min-w-0 overflow-y-auto lg:col-span-7", mobileView !== "preview" && "hidden lg:flex")} />
      </div>
      <footer className="border-t border-zinc-200 bg-white px-4 py-3 text-center text-xs text-zinc-500">
        Creativise CV Builder — Create your next opportunity.
      </footer>
    </main>
  );
}

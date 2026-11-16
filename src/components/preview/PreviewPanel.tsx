"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, Minus, Plus } from "lucide-react";
import { useCV } from "@/context/CVContext";
import { ATSTemplate } from "@/components/templates/ATSTemplate";
import { EuropassTemplate } from "@/components/templates/EuropassTemplate";
import { ModernTemplate } from "@/components/templates/ModernTemplate";
import { cvFontFamily } from "@/components/templates/templateUtils";
import { cn } from "@/lib/utils";

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 1.25;
const ZOOM_STEP = 0.1;
const SHEET_WIDTH = 794;

export function PreviewPanel({ className }: { className?: string }) {
  const { activeCV, isLoaded } = useCV();
  const sheetAreaRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.75);
  const [previewHeight, setPreviewHeight] = useState(1122.52);

  useEffect(() => {
    const element = previewRef.current;
    if (!element) return;
    const updateHeight = () => setPreviewHeight(element.scrollHeight);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    return () => observer.disconnect();
  }, [activeCV]);

  useEffect(() => {
    const area = sheetAreaRef.current;
    if (!area) return;
    const fitToContainer = () => {
      if (area.clientWidth > 0) {
        setZoom(Math.min(1, Math.max(MIN_ZOOM, (area.clientWidth - 24) / SHEET_WIDTH)));
      }
    };
    fitToContainer();
    const observer = new ResizeObserver(fitToContainer);
    observer.observe(area);
    return () => observer.disconnect();
  }, [activeCV]);

  useEffect(() => {
    if (!activeCV) return;

    const styleId = "dynamic-print-page-style";
    let style = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = styleId;
      document.head.appendChild(style);
    }

    const isModern = activeCV.settings.template === "modern";
    style.textContent = isModern
      ? `@media print {
          @page { size: A4 portrait; margin: 0mm !important; }
          html, body {
            width: 210mm !important;
            height: 297mm !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }`
      : `@media print {
          @page { size: A4 portrait; margin: 14mm !important; }
          html, body {
            height: auto !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }`;

    return () => {
      document.getElementById(styleId)?.remove();
    };
  }, [activeCV]);

  const fitToScreen = useCallback(() => {
    const area = sheetAreaRef.current;
    if (!area) return;

    const availableWidth = area.clientWidth - 24;
    setZoom(Math.min(1, Math.max(MIN_ZOOM, availableWidth / SHEET_WIDTH)));
  }, []);

  if (!isLoaded || !activeCV) {
    return (
      <section className={cn("preview-panel flex min-h-full items-center justify-center bg-zinc-100 p-8 text-sm text-zinc-500", className)}>
        Create or select a CV profile to preview it.
      </section>
    );
  }

  const profile = activeCV;
  const template = {
    europass: <EuropassTemplate profile={profile} />,
    modern: <ModernTemplate profile={profile} />,
    ats: <ATSTemplate profile={profile} />,
  }[profile.settings.template];
  return (
    <section className={cn("preview-panel relative flex min-h-full min-w-0 flex-1 flex-col", className)}>
      <div className="flex min-w-0 min-h-11 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white/95 px-4 py-1 backdrop-blur-sm print:hidden">
        <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold capitalize text-slate-700">
            {profile.settings.template === "ats" ? "ATS Minimalist" : profile.settings.template}
          </span>
          <span className="hidden sm:inline">A4 · 210 × 297 mm</span>
        </div>
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-1">
          <button type="button" onClick={() => setZoom((value) => Math.max(MIN_ZOOM, value - ZOOM_STEP))} aria-label="Zoom out" title="Zoom out" className="flex min-h-[42px] min-w-[42px] items-center justify-center rounded-full hover:bg-slate-50">
            <Minus className="size-4" />
          </button>
          <span className="min-w-14 text-center text-xs font-medium tabular-nums">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP))} aria-label="Zoom in" title="Zoom in" className="flex min-h-[42px] min-w-[42px] items-center justify-center rounded-full hover:bg-slate-50">
            <Plus className="size-4" />
          </button>
          <button type="button" onClick={fitToScreen} aria-label="Fit CV to width" title="Fit to width" className="ml-1 rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50">
            <Maximize2 className="mr-1 inline-block size-3.5" />
            Fit to Width
          </button>
        </div>
      </div>

      <div ref={sheetAreaRef} className="preview-sheet-area flex min-w-0 flex-1 items-start justify-center overflow-auto p-3 pb-8 pt-8">
        <div className="print-cv-preview-wrapper" style={{ width: `${SHEET_WIDTH * zoom}px`, height: `${previewHeight * zoom}px` }}>
          <div
            ref={previewRef}
            className="print-cv-preview origin-top-left"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              width: `${SHEET_WIDTH}px`,
              fontFamily: cvFontFamily(profile.settings.fontFamily),
            }}
          >
            {template}
          </div>
        </div>
      </div>
    </section>
  );
}

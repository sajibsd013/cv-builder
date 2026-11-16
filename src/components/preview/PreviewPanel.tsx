"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { FileText, Maximize2, Minus, Plus, Sparkles } from "lucide-react";
import { useCV } from "@/context/CVContext";
import { ATSTemplate } from "@/components/templates/ATSTemplate";
import { EuropassTemplate } from "@/components/templates/EuropassTemplate";
import { ModernTemplate } from "@/components/templates/ModernTemplate";
import { cvFontFamily } from "@/components/templates/templateUtils";
import { cn } from "@/lib/utils";

const MIN_ZOOM = 0.35;
const MAX_ZOOM = 1.25;
const ZOOM_STEP = 0.1;
const SHEET_WIDTH = 794;
const SHEET_HEIGHT = 1123;

export function PreviewPanel({ className }: { className?: string }) {
  const { activeCV, isLoaded, createProfile, loadSampleData } = useCV();
  const sheetAreaRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.75);
  const [unscaledHeight, setUnscaledHeight] = useState(SHEET_HEIGHT);

  useLayoutEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const measured = Math.ceil(el.scrollHeight || SHEET_HEIGHT);
    if (measured > 100 && Math.abs(measured - unscaledHeight) > 4) {
      setUnscaledHeight(measured);
    }
  }, [activeCV, unscaledHeight]);

  const fitToScreen = useCallback(() => {
    const area = sheetAreaRef.current;
    if (!area) return;
    const width = area.getBoundingClientRect().width;
    if (width <= 0) return;
    const availableWidth = width - 32;
    const nextZoom = Math.min(
      1,
      Math.max(MIN_ZOOM, Math.round((availableWidth / SHEET_WIDTH) * 100) / 100)
    );
    setZoom((prev) => (prev === nextZoom ? prev : nextZoom));
  }, []);

  useEffect(() => {
    fitToScreen();
    let timer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timer);
      timer = setTimeout(fitToScreen, 120);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [fitToScreen, isLoaded, activeCV]);

  // Modern CV হলে উচ্চতা অনুযায়ী অটো-স্কেল ফ্যাক্টর হিসাব (যাতে সবসময় ১ পেজে ফিট হয়)
  const modernPrintScale =
    unscaledHeight > SHEET_HEIGHT
      ? Math.max(0.65, Math.floor((SHEET_HEIGHT / unscaledHeight) * 1000) / 1000)
      : 1;

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
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden;
          }
          #cv-preview-wrapper,
          #cv-preview-wrapper * {
            visibility: visible;
          }
          #cv-preview-wrapper {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            background: white !important;
            z-index: 99999 !important;
          }
          .print-cv-preview {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: ${SHEET_WIDTH}px !important;
            min-height: ${Math.round(SHEET_HEIGHT / modernPrintScale)}px !important;
            transform: scale(${modernPrintScale}) !important;
            transform-origin: top left !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
          *::-webkit-scrollbar { display: none !important; width: 0 !important; }
        }`
      : `@media print {
          @page { size: A4 portrait; margin: 14mm !important; }
          html, body {
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* শুধুমাত্র CV-র বাইরের নেভবার ও এডিটর হাইড করা হবে, CV-র ভেতরের <header> নয় */
          header:not(#cv-preview-wrapper header),
          nav:not(#cv-preview-wrapper nav),
          aside:not(#cv-preview-wrapper aside),
          [data-editor-panel] {
            display: none !important;
          }
          body * {
            visibility: hidden;
          }
          #cv-preview-wrapper,
          #cv-preview-wrapper * {
            visibility: visible;
          }
          #cv-preview-wrapper {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: white !important;
          }
          .print-cv-preview {
            position: relative !important;
            width: 100% !important;
            transform: none !important;
            scale: 1 !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
          *::-webkit-scrollbar { display: none !important; width: 0 !important; }
        }`;

    return () => {
      document.getElementById(styleId)?.remove();
    };
  }, [activeCV?.settings.template, modernPrintScale]);

  if (!isLoaded) {
    return (
      <section
        className={cn(
          "preview-panel flex min-h-full flex-1 flex-col items-center justify-center bg-slate-100/80 p-8",
          className
        )}
      >
        <div className="aspect-[210/297] w-full max-w-[460px] animate-pulse rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-1/2 rounded bg-slate-200" />
          <div className="mt-2 h-3.5 w-1/3 rounded bg-slate-100" />
          <div className="mt-6 space-y-2.5">
            <div className="h-3 w-full rounded bg-slate-100" />
            <div className="h-3 w-5/6 rounded bg-slate-100" />
            <div className="h-3 w-4/6 rounded bg-slate-100" />
          </div>
        </div>
      </section>
    );
  }

  if (!activeCV) {
    return (
      <section
        className={cn(
          "preview-panel flex min-h-full flex-1 items-center justify-center bg-slate-100/80 p-8",
          className
        )}
      >
        <div className="flex aspect-[210/297] w-full max-w-[440px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/90 p-8 text-center shadow-xs">
          <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <FileText className="size-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Live A4 Preview</h3>
          <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
            Your formatted CV will appear here in real time as you fill out your details.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => createProfile()}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
            >
              <Plus className="size-3.5" />
              New CV
            </button>
            <button
              type="button"
              onClick={loadSampleData}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Sparkles className="size-3.5 text-amber-500" />
              Load Sample
            </button>
          </div>
        </div>
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
    <section
      className={cn(
        "preview-panel relative flex min-h-full min-w-0 flex-1 flex-col print:block print:min-h-0 print:overflow-visible",
        className
      )}
    >
      <div className="flex min-h-11 min-w-0 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white/95 px-4 py-1 backdrop-blur-sm print:hidden">
        <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold capitalize text-slate-700">
            {profile.settings.template === "ats"
              ? "ATS Minimalist"
              : profile.settings.template}
          </span>
          <span className="hidden sm:inline">A4 · 210 × 297 mm</span>
        </div>
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-1">
          <button
            type="button"
            onClick={() =>
              setZoom((value) =>
                Math.max(MIN_ZOOM, Math.round((value - ZOOM_STEP) * 100) / 100)
              )
            }
            aria-label="Zoom out"
            title="Zoom out"
            className="flex min-h-[38px] min-w-[38px] items-center justify-center rounded-full hover:bg-slate-100"
          >
            <Minus className="size-4" />
          </button>
          <span className="min-w-12 text-center text-xs font-medium tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() =>
              setZoom((value) =>
                Math.min(MAX_ZOOM, Math.round((value + ZOOM_STEP) * 100) / 100)
              )
            }
            aria-label="Zoom in"
            title="Zoom in"
            className="flex min-h-[38px] min-w-[38px] items-center justify-center rounded-full hover:bg-slate-100"
          >
            <Plus className="size-4" />
          </button>
          <button
            type="button"
            onClick={fitToScreen}
            aria-label="Fit CV to width"
            title="Fit to width"
            className="ml-1 rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Maximize2 className="mr-1 inline-block size-3.5" />
            Fit to Width
          </button>
        </div>
      </div>

      <div
        ref={sheetAreaRef}
        className="preview-sheet-area flex min-w-0 flex-1 items-start justify-center overflow-y-scroll overflow-x-hidden p-4 pb-12 pt-6 print:block print:overflow-visible print:p-0"
      >
        <div
          id="cv-preview-wrapper"
          className="print-cv-preview-wrapper shrink-0"
          style={{
            width: `${Math.round(SHEET_WIDTH * zoom)}px`,
            height: `${Math.round(unscaledHeight * zoom)}px`,
          }}
        >
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
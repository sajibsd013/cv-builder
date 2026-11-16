# AGENTS.md - CV Builder Pro Architecture & Coding Rules

## 1. Project Overview
We are building a professional, client-side **CV Builder Web Application** using **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**. 
- **Zero Backend / Zero Database:** All user data, multiple CV profiles, and uploaded images (compressed Base64) MUST be persisted strictly in `localStorage`.
- **Static Export Ready:** Do not use Next.js Server Actions, API routes, or server-only headers/cookies. Everything runs on the client.

## 2. Tech Stack & Conventions
- **Framework:** Next.js (App Router) with `'use client'` on interactive components.
- **Styling:** Tailwind CSS + `clsx` + `tailwind-merge` (use a `cn()` utility in `src/lib/utils.ts`).
- **Icons:** `lucide-react` exclusively.
- **State & Storage:** Custom React hooks + React Context (`CVContext`) synced with `localStorage`. Guard all `window` and `localStorage` calls against SSR hydration mismatches (`typeof window !== 'undefined'` or `useEffect` initialization).

## 3. Folder Structure
Maintain this exact directory structure inside `src/`:
- `src/app/` — App Router pages (`page.tsx` for landing/dashboard or direct editor, `layout.tsx`, `globals.css`).
- `src/types/` — TypeScript interfaces (`cv.ts`).
- `src/context/` — Global state provider (`CVContext.tsx`) managing active CV, profile switching, and auto-save.
- `src/hooks/` — Reusable hooks (`useLocalStorage.ts`, `useDebounce.ts`).
- `src/lib/` — Pure utilities (`utils.ts`, `imageCompressor.ts`, `atsMatcher.ts`, `sampleData.ts`).
- `src/components/editor/` — Form panels, accordion sections, image uploader, section reorderer.
- `src/components/templates/` — Print-ready A4 CV templates (`EuropassTemplate.tsx`, `ModernTemplate.tsx`, `ATSTemplate.tsx`).
- `src/components/preview/` — Live A4 preview wrapper with zoom controls and print trigger.
- `src/components/modals/` — ATS Keyword Matcher modal, JSON Import/Export modal, Profile Manager.
- `src/components/ui/` — Reusable clean UI primitives (Buttons, Inputs, Accordion, Tabs).

## 4. Critical Engineering Constraints
1. **Hydration Safety:** Because data comes from `localStorage`, always handle initial mount states cleanly using an `isLoaded` flag to prevent Next.js hydration errors.
2. **LocalStorage Quota Protection:** `localStorage` has a ~5MB limit. Never store raw images. Always pass uploaded images through `src/lib/imageCompressor.ts` (HTML5 Canvas resize to max 300x300px, JPEG quality 0.75) before saving to state.
3. **Print / PDF Perfection (`@media print`):**
   - The CV preview must render at exact A4 dimensions (`210mm` width, `min-height: 297mm`).
   - When `window.print()` is triggered, hide all editor UI, sidebars, toolbars, and shadows using `print:hidden`.
   - Ensure text remains selectable vector text in the exported PDF (do NOT convert the DOM to a raster image using html2canvas).
   - Use `break-inside-avoid` on individual job/education items so entries don't split awkwardly across pages.
4. **Code Quality:** Write modular, strictly typed TypeScript (`no any`). Keep components under 250 lines by extracting sub-components.
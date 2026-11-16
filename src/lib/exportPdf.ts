import type { CVProfile } from "@/types/cv";

export function exportCVToPDF(profile: CVProfile): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("PDF export is only available in a browser.");
  }

  const previousTitle = document.title;
  const name = profile.personalInfo.fullName?.trim().replace(/\s+/g, "_") || "Creativise";
  const restoreTitle = () => {
    document.title = previousTitle;
    window.removeEventListener("afterprint", restoreTitle);
  };

  document.title = `${name}_CV`;
  window.addEventListener("afterprint", restoreTitle, { once: true });
  window.print();
}

"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { useCV } from "@/context/CVContext";
import { ImageUploader } from "@/components/editor/ImageUploader";
import { cn } from "@/lib/utils";
import type {
  CVProfile,
  CVTemplate,
  EducationItem,
  ExperienceItem,
  LanguageItem,
  ProjectItem,
  SectionKey,
  SkillItem,
} from "@/types/cv";

type Tab = "content" | "design";
type ListKey = "experience" | "education" | "skills" | "projects" | "languages";

const sectionLabels: Record<SectionKey, string> = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  languages: "Languages",
  custom: "Custom Sections",
};

const newId = () => `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function Field({
  label,
  value,
  onChange,
  multiline = false,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  multiline?: boolean;
  type?: string;
  placeholder?: string;
}) {
  const classes =
    "min-h-[42px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";
  return (
    <label className="block min-w-0 space-y-1">
      <span className="text-xs font-medium text-zinc-600">{label}</span>
      {multiline ? (
        <textarea
          className={cn(classes, "min-h-24 resize-y")}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          className={classes}
          type={type}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block min-w-0 space-y-1">
      <span className="text-xs font-medium text-zinc-600">{label}</span>
      <select
        className="min-h-[42px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "inter"
              ? "Inter"
              : option === "jakarta"
                ? "Plus Jakarta Sans"
                : option === "merriweather"
                  ? "Merriweather"
                  : option === "roboto"
                    ? "Roboto"
                    : option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="editor-accordion overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs transition-shadow hover:shadow-sm">
      <button
        type="button"
        className="flex min-h-[42px] w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        {title}
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="space-y-4 border-t border-zinc-100 p-4">{children}</div>}
    </section>
  );
}

function ItemActions({
  index,
  count,
  onMove,
  onRemove,
}: {
  index: number;
  count: number;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1">
      <GripVertical className="mr-1 size-4 text-zinc-300" aria-hidden="true" />
      <button type="button" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Move up" className="flex min-h-[42px] min-w-[42px] items-center justify-center rounded p-1 text-zinc-500 hover:bg-zinc-100 disabled:opacity-30">
        <ChevronUp className="size-4" />
      </button>
      <button type="button" disabled={index === count - 1} onClick={() => onMove(1)} aria-label="Move down" className="flex min-h-[42px] min-w-[42px] items-center justify-center rounded p-1 text-zinc-500 hover:bg-zinc-100 disabled:opacity-30">
        <ChevronDown className="size-4" />
      </button>
      <button type="button" onClick={onRemove} aria-label="Remove item" className="flex min-h-[42px] min-w-[42px] items-center justify-center rounded p-1 text-red-500 hover:bg-red-50">
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

function AddButton({ children, onClick }: { children: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex min-h-[42px] items-center gap-1.5 rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-600 hover:border-blue-400 hover:text-blue-600">
      <Plus className="size-3.5" />
      {children}
    </button>
  );
}

function ContentEditor({ cv, update }: { cv: CVProfile; update: (updates: Partial<CVProfile>) => void }) {
  const [skillInput, setSkillInput] = useState("");
  const updateList = <K extends ListKey>(key: K, value: CVProfile[K]) => update({ [key]: value } as Partial<CVProfile>);
  const move = <K extends ListKey>(key: K, index: number, direction: -1 | 1) => {
    const list = [...cv[key]] as Array<ExperienceItem | EducationItem | SkillItem | ProjectItem | LanguageItem>;
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    updateList(key, list as CVProfile[K]);
  };
  const remove = <K extends ListKey>(key: K, index: number) => updateList(key, cv[key].filter((_, itemIndex) => itemIndex !== index) as CVProfile[K]);
  const addSkills = (value: string) => {
    const names = value.split(",").map((name) => name.trim()).filter(Boolean);
    if (!names.length) return;
    const existing = new Set(cv.skills.map((skill) => skill.name.toLowerCase()));
    const additions = names.filter((name) => !existing.has(name.toLowerCase())).map((name) => ({ id: newId(), name }));
    if (additions.length) updateList("skills", [...cv.skills, ...additions]);
    setSkillInput("");
  };
  const handleSkillKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addSkills(skillInput);
    }
  };

  return (
    <div className="min-w-0 space-y-3">
      <Accordion title="Personal Info" defaultOpen>
        <ImageUploader photo={cv.personalInfo.photo} shape={cv.personalInfo.photoShape} onPhotoChange={(photo) => update({ personalInfo: { ...cv.personalInfo, photo } })} onShapeChange={(photoShape) => update({ personalInfo: { ...cv.personalInfo, photoShape } })} />
        <div className="grid gap-3 sm:grid-cols-2">
          {(["fullName", "jobTitle", "email", "phone", "location", "website", "linkedin", "github"] as const).map((key) => (
            <Field key={key} label={key.replace(/([A-Z])/g, " $1")} value={cv.personalInfo[key]} onChange={(value) => update({ personalInfo: { ...cv.personalInfo, [key]: value } })} />
          ))}
        </div>
      </Accordion>

      <Accordion title="Summary">
        <Field label="Professional summary" value={cv.personalInfo.summary} multiline onChange={(summary) => update({ personalInfo: { ...cv.personalInfo, summary } })} />
      </Accordion>

      <Accordion title={`Experience (${cv.experience.length})`}>
        {cv.experience.map((item, index) => (
          <div key={item.id} className="space-y-3 rounded-lg border border-zinc-100 bg-zinc-50/70 p-3">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2"><span className="min-w-0 truncate text-xs font-semibold text-zinc-700">{item.jobTitle || "Experience item"}</span><ItemActions index={index} count={cv.experience.length} onMove={(direction) => move("experience", index, direction)} onRemove={() => remove("experience", index)} /></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Job title" value={item.jobTitle} onChange={(jobTitle) => updateList("experience", cv.experience.map((entry) => entry.id === item.id ? { ...entry, jobTitle } : entry))} />
              <Field label="Company" value={item.company} onChange={(company) => updateList("experience", cv.experience.map((entry) => entry.id === item.id ? { ...entry, company } : entry))} />
              <Field label="Start date" type="month" value={item.startDate} onChange={(startDate) => updateList("experience", cv.experience.map((entry) => entry.id === item.id ? { ...entry, startDate } : entry))} />
              <Field label="End date" type="month" value={item.endDate} onChange={(endDate) => updateList("experience", cv.experience.map((entry) => entry.id === item.id ? { ...entry, endDate, isCurrent: false } : entry))} />
            </div>
            <Field label="Achievements (one per line)" multiline value={item.achievements.join("\n")} onChange={(value) => updateList("experience", cv.experience.map((entry) => entry.id === item.id ? { ...entry, achievements: value.split("\n") } : entry))} />
          </div>
        ))}
        <AddButton onClick={() => updateList("experience", [...cv.experience, { id: newId(), jobTitle: "", company: "", startDate: "", isCurrent: false, achievements: [], technologies: [] }])}>Add experience</AddButton>
      </Accordion>

      <Accordion title={`Education (${cv.education.length})`}>
        {cv.education.map((item, index) => (
          <div key={item.id} className="space-y-3 rounded-lg border border-zinc-100 bg-zinc-50/70 p-3">
            <div className="flex items-center justify-between"><span className="text-xs font-semibold text-zinc-700">{item.degree || "Education item"}</span><ItemActions index={index} count={cv.education.length} onMove={(direction) => move("education", index, direction)} onRemove={() => remove("education", index)} /></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Degree" value={item.degree} onChange={(degree) => updateList("education", cv.education.map((entry) => entry.id === item.id ? { ...entry, degree } : entry))} />
              <Field label="Institution" value={item.institution} onChange={(institution) => updateList("education", cv.education.map((entry) => entry.id === item.id ? { ...entry, institution } : entry))} />
              <Field label="Start year" value={item.startDate} onChange={(startDate) => updateList("education", cv.education.map((entry) => entry.id === item.id ? { ...entry, startDate } : entry))} />
              <Field label="End year" value={item.endDate} onChange={(endDate) => updateList("education", cv.education.map((entry) => entry.id === item.id ? { ...entry, endDate } : entry))} />
            </div>
          </div>
        ))}
        <AddButton onClick={() => updateList("education", [...cv.education, { id: newId(), degree: "", institution: "", startDate: "" }])}>Add education</AddButton>
      </Accordion>

      <Accordion title={`Skills (${cv.skills.length})`}>
        <div className="flex min-w-0 flex-wrap gap-2">
          {cv.skills.map((item) => <span key={item.id} className="inline-flex max-w-full items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700"><span className="truncate">{item.name}</span><button type="button" aria-label={`Remove ${item.name}`} onClick={() => updateList("skills", cv.skills.filter((entry) => entry.id !== item.id))} className="min-h-6 min-w-6 rounded-full text-slate-500 hover:bg-white hover:text-red-500">×</button></span>)}
        </div>
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
          <input aria-label="Add skills" value={skillInput} onChange={(event) => setSkillInput(event.target.value)} onKeyDown={handleSkillKeyDown} placeholder="Type a skill, then press Enter or use commas" className="min-h-[42px] min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
          <AddButton onClick={() => addSkills(skillInput)}>Add skill</AddButton>
        </div>
      </Accordion>

      <Accordion title={`Projects (${cv.projects.length})`}>
        {cv.projects.map((item, index) => (
          <div key={item.id} className="space-y-3 rounded-lg border border-zinc-100 bg-zinc-50/70 p-3">
            <div className="flex items-center justify-between"><span className="text-xs font-semibold text-zinc-700">{item.name || "Project item"}</span><ItemActions index={index} count={cv.projects.length} onMove={(direction) => move("projects", index, direction)} onRemove={() => remove("projects", index)} /></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Project name" value={item.name} onChange={(name) => updateList("projects", cv.projects.map((entry) => entry.id === item.id ? { ...entry, name } : entry))} />
              <Field label="URL" value={item.url} onChange={(url) => updateList("projects", cv.projects.map((entry) => entry.id === item.id ? { ...entry, url } : entry))} />
            </div>
            <Field label="Description" value={item.description} multiline onChange={(description) => updateList("projects", cv.projects.map((entry) => entry.id === item.id ? { ...entry, description } : entry))} />
          </div>
        ))}
        <AddButton onClick={() => updateList("projects", [...cv.projects, { id: newId(), name: "", description: "", technologies: [], highlights: [] }])}>Add project</AddButton>
      </Accordion>

      <Accordion title={`Languages (${cv.languages.length})`}>
        {cv.languages.map((item, index) => (
          <div key={item.id} className="grid min-w-0 items-end gap-2 sm:grid-cols-2">
            <Field label="Language" value={item.language} onChange={(language) => updateList("languages", cv.languages.map((entry) => entry.id === item.id ? { ...entry, language } : entry))} />
            <SelectField label="CEFR level" value={item.proficiency} options={["A1", "A2", "B1", "B2", "C1", "C2"]} onChange={(proficiency) => updateList("languages", cv.languages.map((entry) => entry.id === item.id ? { ...entry, proficiency: proficiency as LanguageItem["proficiency"] } : entry))} />
            <Field label="Certification" value={item.certification} onChange={(certification) => updateList("languages", cv.languages.map((entry) => entry.id === item.id ? { ...entry, certification } : entry))} />
            <ItemActions index={index} count={cv.languages.length} onMove={(direction) => move("languages", index, direction)} onRemove={() => remove("languages", index)} />
          </div>
        ))}
        <AddButton onClick={() => updateList("languages", [...cv.languages, { id: newId(), language: "", proficiency: "B1" }])}>Add language</AddButton>
      </Accordion>

      <Accordion title={`Custom Sections (${cv.customSections.length})`}>
        {cv.customSections.map((section, index) => (
          <div key={section.id} className="space-y-3 rounded-lg border border-zinc-100 bg-zinc-50/70 p-3">
            <div className="flex items-center justify-between"><Field label="Section title" value={section.title} onChange={(title) => update({ customSections: cv.customSections.map((entry) => entry.id === section.id ? { ...entry, title } : entry) })} /><div className="ml-3 flex items-center gap-1">            <button type="button" disabled={index === 0} onClick={() => { const next = [...cv.customSections]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; update({ customSections: next }); }} className="flex min-h-[42px] min-w-[42px] items-center justify-center"><ChevronUp className="size-4" /></button><button type="button" onClick={() => update({ customSections: cv.customSections.filter((entry) => entry.id !== section.id) })} className="flex min-h-[42px] min-w-[42px] items-center justify-center"><Trash2 className="size-4 text-red-500" /></button></div></div>
            {section.items.map((entry, itemIndex) => <div key={entry.id} className="flex items-end gap-2"><div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2"><Field label="Item title" value={entry.title} onChange={(title) => update({ customSections: cv.customSections.map((current) => current.id === section.id ? { ...current, items: current.items.map((item) => item.id === entry.id ? { ...item, title } : item) } : current) })} /><Field label="Details" value={entry.content} onChange={(content) => update({ customSections: cv.customSections.map((current) => current.id === section.id ? { ...current, items: current.items.map((item) => item.id === entry.id ? { ...item, content } : item) } : current) })} /></div><button type="button" aria-label="Remove custom item" onClick={() => update({ customSections: cv.customSections.map((current) => current.id === section.id ? { ...current, items: current.items.filter((item) => item.id !== entry.id) } : current) })} className="mb-1 rounded p-1 text-red-500 hover:bg-red-50"><Trash2 className="size-4" /></button><button type="button" disabled={itemIndex === 0} onClick={() => { const items = [...section.items]; [items[itemIndex - 1], items[itemIndex]] = [items[itemIndex], items[itemIndex - 1]]; update({ customSections: cv.customSections.map((current) => current.id === section.id ? { ...current, items } : current) }); }} className="mb-1 rounded p-1 hover:bg-zinc-100 disabled:opacity-30"><ChevronUp className="size-4" /></button></div>)}
            <AddButton onClick={() => update({ customSections: cv.customSections.map((current) => current.id === section.id ? { ...current, items: [...current.items, { id: newId(), title: "", content: "" }] } : current) })}>Add item</AddButton>
          </div>
        ))}
        <AddButton onClick={() => update({ customSections: [...cv.customSections, { id: newId(), title: "New Section", items: [] }] })}>Add custom section</AddButton>
      </Accordion>
    </div>
  );
}

function DesignEditor({ cv, update }: { cv: CVProfile; update: (updates: Partial<CVProfile>) => void }) {
  const templates: Array<{ value: CVTemplate; label: string; description: string }> = [
    { value: "europass", label: "Europass", description: "Structured and internationally recognized" },
    { value: "modern", label: "Modern", description: "Clean, balanced, and visual" },
    { value: "ats", label: "ATS Minimalist", description: "Plain and machine-readable" },
  ];
  const colors = ["#2563eb", "#7c3aed", "#0891b2", "#059669", "#dc2626", "#d97706", "#18181b"];
  const updateSettings = (settings: Partial<CVProfile["settings"]>) => update({ settings: { ...cv.settings, ...settings } });
  const moveSection = (index: number, direction: -1 | 1) => {
    const order = [...cv.settings.sectionOrder];
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    [order[index], order[target]] = [order[target], order[index]];
    updateSettings({ sectionOrder: order });
  };
  return (
    <div className="min-w-0 space-y-5">
      <section>
        <h3 className="mb-3 text-sm font-semibold text-zinc-900">Template</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {templates.map((template) => <button key={template.value} type="button" onClick={() => updateSettings({ template: template.value })} className={cn("rounded-xl border p-3 text-left transition", cv.settings.template === template.value ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100" : "border-zinc-200 hover:border-zinc-400")}><div className="mb-2 h-16 rounded bg-white shadow-sm"><div className="h-2 w-2/3 rounded bg-zinc-300" /></div><div className="text-sm font-semibold">{template.label}</div><div className="mt-1 text-xs text-zinc-500">{template.description}</div></button>)}
        </div>
      </section>
      <section>
        <h3 className="mb-3 text-sm font-semibold text-zinc-900">Accent color</h3>
        <div className="flex flex-wrap items-center gap-2"><div className="flex gap-2">{colors.map((color) => <button key={color} type="button" aria-label={`Use ${color}`} onClick={() => updateSettings({ accentColor: color })} className={cn("size-8 rounded-full border-2 border-white shadow ring-1 ring-zinc-200", cv.settings.accentColor === color && "ring-2 ring-blue-500")} style={{ backgroundColor: color }} />)}</div><input aria-label="Custom accent hex" type="text" value={cv.settings.accentColor} onChange={(event) => updateSettings({ accentColor: event.target.value })} className="w-28 rounded-lg border border-zinc-200 px-2 py-1.5 text-sm" /></div>
      </section>
      <SelectField label="Font family" value={cv.settings.fontFamily} options={["inter", "roboto", "merriweather", "jakarta"]} onChange={(fontFamily) => updateSettings({ fontFamily: fontFamily as CVProfile["settings"]["fontFamily"] })} />
      <section>
        <h3 className="mb-3 text-sm font-semibold text-zinc-900">Section order</h3>
        <div className="space-y-2">{cv.settings.sectionOrder.map((section, index) => <div key={section} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"><span className="flex items-center gap-2"><GripVertical className="size-4 text-zinc-400" />{sectionLabels[section]}</span><span className="flex gap-1"><button type="button" disabled={index === 0} onClick={() => moveSection(index, -1)} className="rounded p-1 hover:bg-zinc-100 disabled:opacity-30"><ChevronUp className="size-4" /></button><button type="button" disabled={index === cv.settings.sectionOrder.length - 1} onClick={() => moveSection(index, 1)} className="rounded p-1 hover:bg-zinc-100 disabled:opacity-30"><ChevronDown className="size-4" /></button></span></div>)}</div>
      </section>
    </div>
  );
}

export function EditorPanel({ className }: { className?: string }) {
  const { activeCV, isLoaded, updateActiveCV } = useCV();
  const [tab, setTab] = useState<Tab>("content");
  if (!isLoaded || !activeCV) return <aside className={cn("flex w-full items-center justify-center p-6 text-sm text-zinc-500", className)}>Create or select a CV profile to start editing.</aside>;
  const update = (updates: Partial<CVProfile>) => updateActiveCV(updates);
  return (
    <aside className={cn("editor-panel flex min-w-0 w-full flex-col border-r border-slate-200/80 bg-slate-50/70", className)}>
      <div className="border-b border-slate-200/80 bg-slate-50/70 p-3">
        <div className="flex rounded-full border border-slate-200/80 bg-white p-1 shadow-xs">
          {(["content", "design"] as const).map((value) => <button key={value} type="button" onClick={() => setTab(value)} className={cn("flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-all", tab === value ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-900")}>{value === "content" ? "Content" : "Design & Layout"}</button>)}
        </div>
      </div>
      <div className="min-w-0 overflow-y-auto p-4">{tab === "content" ? <ContentEditor cv={activeCV} update={update} /> : <DesignEditor cv={activeCV} update={update} />}</div>
    </aside>
  );
}

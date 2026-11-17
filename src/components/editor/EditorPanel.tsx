"use client";

import { useState, type DragEvent, type KeyboardEvent, type ReactNode } from "react";
import {
  Award,
  Briefcase,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  FolderGit2,
  Globe,
  GraduationCap,
  GripVertical,
  Languages,
  Layers,
  LayoutTemplate,
  Link2,
  Mail,
  MapPin,
  Palette,
  Phone,
  Plus,
  Sparkles,
  Trash2,
  Type,
  User,
  Wrench,
  X,
} from "lucide-react";
import { useCV } from "@/context/CVContext";
import { ImageUploader } from "@/components/editor/ImageUploader";
import { RichTextField } from "@/components/editor/RichTextField";
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

const sectionMeta: Record<SectionKey, { label: string; icon: ReactNode }> = {
  summary: { label: "Summary", icon: <FileText className="size-3.5 text-slate-400" /> },
  experience: { label: "Experience", icon: <Briefcase className="size-3.5 text-slate-400" /> },
  education: { label: "Education", icon: <GraduationCap className="size-3.5 text-slate-400" /> },
  skills: { label: "Skills", icon: <Wrench className="size-3.5 text-slate-400" /> },
  projects: { label: "Projects", icon: <FolderGit2 className="size-3.5 text-slate-400" /> },
  languages: { label: "Languages", icon: <Languages className="size-3.5 text-slate-400" /> },
  custom: { label: "Custom Sections", icon: <Layers className="size-3.5 text-slate-400" /> },
};

const newId = () => `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function reorderArray<T>(list: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= list.length ||
    toIndex >= list.length
  ) {
    return list;
  }
  const next = [...list];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function useDragReorder(onReorder: (from: number, to: number) => void) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const getDragProps = (index: number) => ({
    draggable: true,
    onDragStart: (e: DragEvent<HTMLElement>) => {
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) {
        e.preventDefault();
        return;
      }
      setDragIndex(index);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
    },
    onDragOver: (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (dragIndex !== null && dragIndex !== index && overIndex !== index) {
        setOverIndex(index);
      }
    },
    onDrop: (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      const from = dragIndex ?? Number(e.dataTransfer.getData("text/plain"));
      if (!Number.isNaN(from) && from !== index) {
        onReorder(from, index);
      }
      setDragIndex(null);
      setOverIndex(null);
    },
    onDragEnd: () => {
      setDragIndex(null);
      setOverIndex(null);
    },
  });

  const getDragClasses = (index: number) =>
    cn(
      "transition-all duration-150",
      dragIndex === index && "scale-[0.99] opacity-45",
      overIndex === index &&
        dragIndex !== null &&
        dragIndex !== index &&
        "border-indigo-400 bg-indigo-50/40 ring-2 ring-indigo-500/70"
    );

  return { getDragProps, getDragClasses };
}

function IconInput({
  label,
  icon,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  icon: ReactNode;
  value?: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="group block min-w-0 space-y-1.5">
      <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 transition-colors group-focus-within:text-indigo-600">
        {label}
      </span>
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-3 flex items-center justify-center text-slate-400 transition-colors group-focus-within:text-indigo-600">
          {icon}
        </span>
        <input
          type={type}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[40px] w-full rounded-xl border border-slate-200/90 bg-slate-50/40 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
        />
      </div>
    </label>
  );
}

function PersonalInfoFields({
  personalInfo,
  onChange,
}: {
  personalInfo: CVProfile["personalInfo"];
  onChange: (updated: CVProfile["personalInfo"]) => void;
}) {
  const setField = <K extends keyof CVProfile["personalInfo"]>(
    key: K,
    val: CVProfile["personalInfo"][K]
  ) => onChange({ ...personalInfo, [key]: val });

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <IconInput
          label="Full Name"
          icon={<User className="size-4" />}
          value={personalInfo.fullName}
          placeholder="e.g. Sajib Sutradhar"
          onChange={(val) => setField("fullName", val)}
        />
        <IconInput
          label="Job Title"
          icon={<BriefcaseBusiness className="size-4" />}
          value={personalInfo.jobTitle}
          placeholder="e.g. Full-Stack Software Engineer"
          onChange={(val) => setField("jobTitle", val)}
        />
      </div>

      <div className="rounded-xl border border-slate-200/70 bg-slate-50/40 p-3">
        <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Contact Details
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <IconInput
            label="Email"
            type="email"
            icon={<Mail className="size-4" />}
            value={personalInfo.email}
            placeholder="you@example.com"
            onChange={(val) => setField("email", val)}
          />
          <IconInput
            label="Phone"
            type="tel"
            icon={<Phone className="size-4" />}
            value={personalInfo.phone}
            placeholder="+880 17XX-XXXXXX"
            onChange={(val) => setField("phone", val)}
          />
          <div className="sm:col-span-2">
            <IconInput
              label="Location"
              icon={<MapPin className="size-4" />}
              value={personalInfo.location}
              placeholder="City, Country (e.g. Sylhet, Bangladesh)"
              onChange={(val) => setField("location", val)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/70 bg-slate-50/40 p-3">
        <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Links & Social Profiles
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <IconInput
            label="Website"
            type="url"
            icon={<Globe className="size-4" />}
            value={personalInfo.website}
            placeholder="https://yourwebsite.com"
            onChange={(val) => setField("website", val)}
          />
          <IconInput
            label="Portfolio"
            type="url"
            icon={<Link2 className="size-4" />}
            value={personalInfo.portfolio}
            placeholder="https://portfolio.dev"
            onChange={(val) => setField("portfolio", val)}
          />
          <IconInput
            label="LinkedIn"
            icon={
              <svg className="size-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            }
            value={personalInfo.linkedin}
            placeholder="linkedin.com/in/username"
            onChange={(val) => setField("linkedin", val)}
          />
          <IconInput
            label="GitHub"
            icon={
              <svg className="size-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
              </svg>
            }
            value={personalInfo.github}
            placeholder="github.com/username"
            onChange={(val) => setField("github", val)}
          />
        </div>
      </div>
    </div>
  );
}

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
    "min-h-[38px] w-full rounded-xl border border-slate-200/90 bg-slate-50/40 px-3 py-2 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10";
  return (
    <label className="block min-w-0 space-y-1.5">
      <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>
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
    <label className="block min-w-0 space-y-1.5">
      <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <select
        className="min-h-[38px] w-full cursor-pointer rounded-xl border border-slate-200/90 bg-slate-50/40 px-3 py-2 text-sm font-medium text-slate-900 outline-none transition-all hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "inter"
              ? "Inter — Modern Sans"
              : option === "jakarta"
                ? "Plus Jakarta Sans — Geometric"
                : option === "merriweather"
                  ? "Merriweather — Classic Serif"
                  : option === "roboto"
                    ? "Roboto — Clean Neutral"
                    : option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Accordion({
  title,
  icon,
  badge,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: ReactNode;
  badge?: number;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section
      className={cn(
        "editor-accordion overflow-hidden rounded-2xl border bg-white transition-all duration-200",
        open
          ? "border-slate-200/90 shadow-sm"
          : "border-slate-200/70 shadow-2xs hover:border-slate-300/90"
      )}
    >
      <button
        type="button"
        className="flex min-h-[52px] w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50/70"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <span className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-xl transition-colors",
              open
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600"
            )}
          >
            {icon}
          </span>
          <span className="text-sm font-semibold text-slate-800">{title}</span>
          {typeof badge === "number" && (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
                badge > 0
                  ? "bg-indigo-50 text-indigo-700"
                  : "bg-slate-100 text-slate-500"
              )}
            >
              {badge}
            </span>
          )}
        </span>
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-full transition-colors",
            open ? "bg-slate-100 text-slate-800" : "text-slate-400"
          )}
        >
          <ChevronDown
            className={cn(
              "size-4 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </span>
      </button>
      {open && (
        <div className="space-y-4 border-t border-slate-100 bg-white p-4">
          {children}
        </div>
      )}
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
    <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-slate-200/70 bg-white p-0.5 shadow-2xs">
      <button
        type="button"
        disabled={index === 0}
        onClick={() => onMove(-1)}
        aria-label="Move up"
        title="Move up"
        className="flex size-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronUp className="size-3.5" />
      </button>
      <button
        type="button"
        disabled={index === count - 1}
        onClick={() => onMove(1)}
        aria-label="Move down"
        title="Move down"
        className="flex size-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronDown className="size-3.5" />
      </button>
      <span className="h-3.5 w-px bg-slate-200/80" />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove item"
        title="Remove"
        className="flex size-7 items-center justify-center rounded-md text-rose-500 transition hover:bg-rose-50 hover:text-rose-600"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

function AddButton({ children, onClick }: { children: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-4 py-2 text-xs font-semibold text-slate-700 transition-all hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-700 active:scale-[0.99]"
    >
      <Plus className="size-4 text-indigo-600" />
      {children}
    </button>
  );
}

function TagListEditor({
  label,
  items,
  onChange,
  placeholder = "Type tech & press Enter (e.g. React, Python)",
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  const [inputValue, setInputValue] = useState("");

  const addTags = (raw: string) => {
    const parsed = raw
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    if (!parsed.length) return;
    const existing = new Set(items.map((item) => item.toLowerCase()));
    const uniqueNew = parsed.filter((tag) => !existing.has(tag.toLowerCase()));
    if (uniqueNew.length) {
      onChange([...items, ...uniqueNew]);
    }
    setInputValue("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTags(inputValue);
    } else if (event.key === "Backspace" && !inputValue && items.length > 0) {
      onChange(items.slice(0, -1));
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(items.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-1.5">
      <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <div className="rounded-xl border border-slate-200/90 bg-white p-2.5 transition focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
        {items.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {items.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="inline-flex w-fit max-w-full items-center gap-1 rounded-lg border border-indigo-200/70 bg-indigo-50/80 px-2.5 py-1 text-xs font-medium text-indigo-700"
              >
                <span className="truncate">{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  aria-label={`Remove ${tag}`}
                  className="ml-0.5 inline-flex size-3.5 shrink-0 items-center justify-center rounded text-indigo-400 transition hover:bg-indigo-200/70 hover:text-indigo-900"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => addTags(inputValue)}
            placeholder={placeholder}
            className="min-w-0 flex-1 bg-transparent px-1 py-1 text-xs text-slate-900 outline-none placeholder:text-slate-400"
          />
          {inputValue.trim() && (
            <button
              type="button"
              onClick={() => addTags(inputValue)}
              className="shrink-0 rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-indigo-700"
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StringListEditor({
  label,
  items,
  onChange,
  addLabel,
  placeholder = "Write a bullet point...",
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  addLabel: string;
  placeholder?: string;
}) {
  const { getDragProps, getDragClasses } = useDragReorder((from, to) =>
    onChange(reorderArray(items, from, to))
  );

  const updateItem = (index: number, value: string) =>
    onChange(items.map((item, itemIndex) => (itemIndex === index ? value : item)));

  const moveItem = (index: number, direction: -1 | 1) => {
    onChange(reorderArray(items, index, index + direction));
  };

  return (
    <div className="space-y-2">
      <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            {...getDragProps(index)}
            className={cn(
              "flex items-start gap-1.5 rounded-xl border border-slate-200/80 bg-white p-2 shadow-2xs focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10",
              getDragClasses(index)
            )}
          >
            <span
              title="Drag to reorder"
              className="mt-2 cursor-grab pl-0.5 text-slate-300 transition hover:text-slate-600 active:cursor-grabbing"
            >
              <GripVertical className="size-3.5" />
            </span>
            <textarea
              aria-label={`${label} ${index + 1}`}
              value={item}
              rows={2}
              placeholder={placeholder}
              onChange={(event) => updateItem(index, event.target.value)}
              className="min-h-[38px] min-w-0 flex-1 resize-y bg-transparent px-1.5 py-1 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
            <div className="flex shrink-0 flex-col gap-0.5 sm:flex-row">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => moveItem(index, -1)}
                aria-label={`Move ${label} item up`}
                className="flex size-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
              >
                <ChevronUp className="size-3.5" />
              </button>
              <button
                type="button"
                disabled={index === items.length - 1}
                onClick={() => moveItem(index, 1)}
                aria-label={`Move ${label} item down`}
                className="flex size-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
              >
                <ChevronDown className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
                aria-label={`Delete ${label} item`}
                className="flex size-7 items-center justify-center rounded-md text-rose-400 hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <AddButton onClick={() => onChange([...items, ""])}>{addLabel}</AddButton>
    </div>
  );
}

function ContentEditor({
  cv,
  update,
}: {
  cv: CVProfile;
  update: (updates: Partial<CVProfile>) => void;
}) {
  const [skillInput, setSkillInput] = useState("");
  const updateList = <K extends ListKey>(key: K, value: CVProfile[K]) =>
    update({ [key]: value } as Partial<CVProfile>);

  const move = <K extends ListKey>(key: K, index: number, direction: -1 | 1) => {
    const list = cv[key] as Array<
      ExperienceItem | EducationItem | SkillItem | ProjectItem | LanguageItem
    >;
    updateList(key, reorderArray(list, index, index + direction) as CVProfile[K]);
  };

  const reorderList = <K extends ListKey>(key: K, from: number, to: number) => {
    const list = cv[key] as Array<
      ExperienceItem | EducationItem | SkillItem | ProjectItem | LanguageItem
    >;
    updateList(key, reorderArray(list, from, to) as CVProfile[K]);
  };

  const remove = <K extends ListKey>(key: K, index: number) =>
    updateList(
      key,
      cv[key].filter((_, itemIndex) => itemIndex !== index) as CVProfile[K]
    );

  const expDrag = useDragReorder((from, to) => reorderList("experience", from, to));
  const eduDrag = useDragReorder((from, to) => reorderList("education", from, to));
  const skillDrag = useDragReorder((from, to) => reorderList("skills", from, to));
  const projDrag = useDragReorder((from, to) => reorderList("projects", from, to));
  const langDrag = useDragReorder((from, to) => reorderList("languages", from, to));
  const customDrag = useDragReorder((from, to) =>
    update({ customSections: reorderArray(cv.customSections, from, to) })
  );

  const addSkills = (value: string) => {
    const names = value
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);
    if (!names.length) return;
    const existing = new Set(cv.skills.map((skill) => skill.name.toLowerCase()));
    const additions = names
      .filter((name) => !existing.has(name.toLowerCase()))
      .map((name) => ({ id: newId(), name }));
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
      <Accordion
        title="Personal Info"
        icon={<User className="size-4" />}
        defaultOpen
      >
        <ImageUploader
          photo={cv.personalInfo.photo}
          shape={cv.personalInfo.photoShape}
          onPhotoChange={(photo) =>
            update({ personalInfo: { ...cv.personalInfo, photo } })
          }
          onShapeChange={(photoShape) =>
            update({ personalInfo: { ...cv.personalInfo, photoShape } })
          }
        />
        <PersonalInfoFields
          personalInfo={cv.personalInfo}
          onChange={(personalInfo) => update({ personalInfo })}
        />
      </Accordion>

      <Accordion title="Summary" icon={<FileText className="size-4" />}>
        <RichTextField
          label="Professional summary"
          value={cv.personalInfo.summary}
          onChange={(summary) =>
            update({ personalInfo: { ...cv.personalInfo, summary } })
          }
        />
      </Accordion>

      <Accordion
        title="Experience"
        icon={<Briefcase className="size-4" />}
        badge={cv.experience.length}
      >
        <div className="space-y-3.5">
          {cv.experience.map((item, index) => (
            <div
              key={item.id}
              {...expDrag.getDragProps(index)}
              className={cn(
                "space-y-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5",
                expDrag.getDragClasses(index)
              )}
            >
              <div className="flex min-w-0 items-center justify-between gap-2 border-b border-slate-200/70 pb-2.5">
                <div
                  className="flex min-w-0 cursor-grab items-center gap-2 active:cursor-grabbing"
                  title="Drag to reorder"
                >
                  <GripVertical className="size-4 shrink-0 text-slate-400" />
                  <span className="truncate text-xs font-bold text-slate-800">
                    {item.jobTitle || "New Experience"}
                    {item.company ? ` • ${item.company}` : ""}
                  </span>
                </div>
                <ItemActions
                  index={index}
                  count={cv.experience.length}
                  onMove={(direction) => move("experience", index, direction)}
                  onRemove={() => remove("experience", index)}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Job title"
                  value={item.jobTitle}
                  onChange={(jobTitle) =>
                    updateList(
                      "experience",
                      cv.experience.map((entry) =>
                        entry.id === item.id ? { ...entry, jobTitle } : entry
                      )
                    )
                  }
                />
                <Field
                  label="Company"
                  value={item.company}
                  onChange={(company) =>
                    updateList(
                      "experience",
                      cv.experience.map((entry) =>
                        entry.id === item.id ? { ...entry, company } : entry
                      )
                    )
                  }
                />
                <Field
                  label="Location"
                  value={item.location}
                  onChange={(location) =>
                    updateList(
                      "experience",
                      cv.experience.map((entry) =>
                        entry.id === item.id ? { ...entry, location } : entry
                      )
                    )
                  }
                />
                <Field
                  label="Start date"
                  type="month"
                  value={item.startDate}
                  onChange={(startDate) =>
                    updateList(
                      "experience",
                      cv.experience.map((entry) =>
                        entry.id === item.id ? { ...entry, startDate } : entry
                      )
                    )
                  }
                />
                <Field
                  label="End date"
                  type="month"
                  value={item.endDate}
                  onChange={(endDate) =>
                    updateList(
                      "experience",
                      cv.experience.map((entry) =>
                        entry.id === item.id
                          ? { ...entry, endDate, isCurrent: false }
                          : entry
                      )
                    )
                  }
                />
              </div>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200/70 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  checked={item.isCurrent}
                  onChange={(event) =>
                    updateList(
                      "experience",
                      cv.experience.map((entry) =>
                        entry.id === item.id
                          ? {
                              ...entry,
                              isCurrent: event.target.checked,
                              endDate: event.target.checked
                                ? undefined
                                : entry.endDate,
                            }
                          : entry
                      )
                    )
                  }
                />
                I currently work here
              </label>

              <RichTextField
                label="Role summary / short description"
                value={item.description ?? ""}
                onChange={(description) =>
                  updateList(
                    "experience",
                    cv.experience.map((entry) =>
                      entry.id === item.id ? { ...entry, description } : entry
                    )
                  )
                }
              />

              <StringListEditor
                label="Key Achievements"
                items={item.achievements}
                onChange={(achievements) =>
                  updateList(
                    "experience",
                    cv.experience.map((entry) =>
                      entry.id === item.id ? { ...entry, achievements } : entry
                    )
                  )
                }
                addLabel="Add achievement"
                placeholder="Describe an impact or milestone..."
              />

              <TagListEditor
                label="Technologies & Tools"
                items={item.technologies}
                onChange={(technologies) =>
                  updateList(
                    "experience",
                    cv.experience.map((entry) =>
                      entry.id === item.id ? { ...entry, technologies } : entry
                    )
                  )
                }
              />
            </div>
          ))}
        </div>
        <AddButton
          onClick={() =>
            updateList("experience", [
              ...cv.experience,
              {
                id: newId(),
                jobTitle: "",
                company: "",
                startDate: "",
                isCurrent: false,
                achievements: [],
                technologies: [],
              },
            ])
          }
        >
          Add experience
        </AddButton>
      </Accordion>

      <Accordion
        title="Education"
        icon={<GraduationCap className="size-4" />}
        badge={cv.education.length}
      >
        <div className="space-y-3.5">
          {cv.education.map((item, index) => (
            <div
              key={item.id}
              {...eduDrag.getDragProps(index)}
              className={cn(
                "space-y-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5",
                eduDrag.getDragClasses(index)
              )}
            >
              <div className="flex min-w-0 items-center justify-between gap-2 border-b border-slate-200/70 pb-2.5">
                <div
                  className="flex min-w-0 cursor-grab items-center gap-2 active:cursor-grabbing"
                  title="Drag to reorder"
                >
                  <GripVertical className="size-4 shrink-0 text-slate-400" />
                  <span className="truncate text-xs font-bold text-slate-800">
                    {item.degree || "New Education"}
                  </span>
                </div>
                <ItemActions
                  index={index}
                  count={cv.education.length}
                  onMove={(direction) => move("education", index, direction)}
                  onRemove={() => remove("education", index)}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Degree"
                  value={item.degree}
                  onChange={(degree) =>
                    updateList(
                      "education",
                      cv.education.map((entry) =>
                        entry.id === item.id ? { ...entry, degree } : entry
                      )
                    )
                  }
                />
                <Field
                  label="Institution"
                  value={item.institution}
                  onChange={(institution) =>
                    updateList(
                      "education",
                      cv.education.map((entry) =>
                        entry.id === item.id ? { ...entry, institution } : entry
                      )
                    )
                  }
                />
                <Field
                  label="Location"
                  value={item.location}
                  onChange={(location) =>
                    updateList(
                      "education",
                      cv.education.map((entry) =>
                        entry.id === item.id ? { ...entry, location } : entry
                      )
                    )
                  }
                />
                <Field
                  label="Start year"
                  value={item.startDate}
                  onChange={(startDate) =>
                    updateList(
                      "education",
                      cv.education.map((entry) =>
                        entry.id === item.id ? { ...entry, startDate } : entry
                      )
                    )
                  }
                />
                <Field
                  label="End year"
                  value={item.endDate}
                  onChange={(endDate) =>
                    updateList(
                      "education",
                      cv.education.map((entry) =>
                        entry.id === item.id ? { ...entry, endDate } : entry
                      )
                    )
                  }
                />
              </div>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200/70 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  checked={Boolean(item.isCurrent)}
                  onChange={(event) =>
                    updateList(
                      "education",
                      cv.education.map((entry) =>
                        entry.id === item.id
                          ? {
                              ...entry,
                              isCurrent: event.target.checked,
                              endDate: event.target.checked
                                ? undefined
                                : entry.endDate,
                            }
                          : entry
                      )
                    )
                  }
                />
                Currently studying
              </label>

              <RichTextField
                label="Description"
                value={item.description ?? ""}
                onChange={(description) =>
                  updateList(
                    "education",
                    cv.education.map((entry) =>
                      entry.id === item.id ? { ...entry, description } : entry
                    )
                  )
                }
              />

              <StringListEditor
                label="Achievements & Honors"
                items={item.achievements ?? []}
                onChange={(achievements) =>
                  updateList(
                    "education",
                    cv.education.map((entry) =>
                      entry.id === item.id ? { ...entry, achievements } : entry
                    )
                  )
                }
                addLabel="Add achievement"
              />
            </div>
          ))}
        </div>
        <AddButton
          onClick={() =>
            updateList("education", [
              ...cv.education,
              { id: newId(), degree: "", institution: "", startDate: "" },
            ])
          }
        >
          Add education
        </AddButton>
      </Accordion>

      <Accordion
        title="Skills"
        icon={<Wrench className="size-4" />}
        badge={cv.skills.length}
      >
        <div className="space-y-2.5">
          {cv.skills.map((item, index) => (
            <div
              key={item.id}
              {...skillDrag.getDragProps(index)}
              className={cn(
                "grid min-w-0 items-end gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3 sm:grid-cols-[auto_1fr_1fr_84px_auto]",
                skillDrag.getDragClasses(index)
              )}
            >
              <span
                title="Drag to reorder"
                className="mb-2.5 hidden cursor-grab text-slate-400 hover:text-slate-600 active:cursor-grabbing sm:block"
              >
                <GripVertical className="size-4" />
              </span>
              <Field
                label="Skill"
                value={item.name}
                onChange={(name) =>
                  updateList(
                    "skills",
                    cv.skills.map((entry) =>
                      entry.id === item.id ? { ...entry, name } : entry
                    )
                  )
                }
              />
              <Field
                label="Category"
                value={item.category}
                onChange={(category) =>
                  updateList(
                    "skills",
                    cv.skills.map((entry) =>
                      entry.id === item.id ? { ...entry, category } : entry
                    )
                  )
                }
              />
              <Field
                label="Years"
                type="number"
                value={item.yearsOfExperience}
                onChange={(years) =>
                  updateList(
                    "skills",
                    cv.skills.map((entry) =>
                      entry.id === item.id
                        ? {
                            ...entry,
                            yearsOfExperience: years ? Number(years) : undefined,
                          }
                        : entry
                    )
                  )
                }
              />
              <ItemActions
                index={index}
                count={cv.skills.length}
                onMove={(direction) => move("skills", index, direction)}
                onRemove={() => remove("skills", index)}
              />
            </div>
          ))}
        </div>
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
          <input
            aria-label="Add skills"
            value={skillInput}
            onChange={(event) => setSkillInput(event.target.value)}
            onKeyDown={handleSkillKeyDown}
            placeholder="Type skills separated by commas, then press Enter"
            className="min-h-[40px] min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          />
          <button
            type="button"
            onClick={() => addSkills(skillInput)}
            className="inline-flex min-h-[40px] shrink-0 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus className="size-3.5" />
            Add skill
          </button>
        </div>
      </Accordion>

      <Accordion
        title="Projects"
        icon={<FolderGit2 className="size-4" />}
        badge={cv.projects.length}
      >
        <div className="space-y-3.5">
          {cv.projects.map((item, index) => (
            <div
              key={item.id}
              {...projDrag.getDragProps(index)}
              className={cn(
                "space-y-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5",
                projDrag.getDragClasses(index)
              )}
            >
              <div className="flex min-w-0 items-center justify-between gap-2 border-b border-slate-200/70 pb-2.5">
                <div
                  className="flex min-w-0 cursor-grab items-center gap-2 active:cursor-grabbing"
                  title="Drag to reorder"
                >
                  <GripVertical className="size-4 shrink-0 text-slate-400" />
                  <span className="truncate text-xs font-bold text-slate-800">
                    {item.name || "New Project"}
                  </span>
                </div>
                <ItemActions
                  index={index}
                  count={cv.projects.length}
                  onMove={(direction) => move("projects", index, direction)}
                  onRemove={() => remove("projects", index)}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Project name"
                  value={item.name}
                  onChange={(name) =>
                    updateList(
                      "projects",
                      cv.projects.map((entry) =>
                        entry.id === item.id ? { ...entry, name } : entry
                      )
                    )
                  }
                />
                <Field
                  label="Live URL"
                  value={item.url}
                  onChange={(url) =>
                    updateList(
                      "projects",
                      cv.projects.map((entry) =>
                        entry.id === item.id ? { ...entry, url } : entry
                      )
                    )
                  }
                />
                <Field
                  label="Repository URL"
                  value={item.repositoryUrl}
                  onChange={(repositoryUrl) =>
                    updateList(
                      "projects",
                      cv.projects.map((entry) =>
                        entry.id === item.id ? { ...entry, repositoryUrl } : entry
                      )
                    )
                  }
                />
                <Field
                  label="Start date"
                  value={item.startDate}
                  onChange={(startDate) =>
                    updateList(
                      "projects",
                      cv.projects.map((entry) =>
                        entry.id === item.id ? { ...entry, startDate } : entry
                      )
                    )
                  }
                />
                <Field
                  label="End date"
                  value={item.endDate}
                  onChange={(endDate) =>
                    updateList(
                      "projects",
                      cv.projects.map((entry) =>
                        entry.id === item.id ? { ...entry, endDate } : entry
                      )
                    )
                  }
                />
              </div>

              <RichTextField
                label="Description"
                value={item.description}
                onChange={(description) =>
                  updateList(
                    "projects",
                    cv.projects.map((entry) =>
                      entry.id === item.id ? { ...entry, description } : entry
                    )
                  )
                }
              />

              <StringListEditor
                label="Key Highlights"
                items={item.highlights}
                onChange={(highlights) =>
                  updateList(
                    "projects",
                    cv.projects.map((entry) =>
                      entry.id === item.id ? { ...entry, highlights } : entry
                    )
                  )
                }
                addLabel="Add bullet point"
                placeholder="Describe a key feature or outcome..."
              />

              <TagListEditor
                label="Technologies Used"
                items={item.technologies}
                onChange={(technologies) =>
                  updateList(
                    "projects",
                    cv.projects.map((entry) =>
                      entry.id === item.id ? { ...entry, technologies } : entry
                    )
                  )
                }
              />
            </div>
          ))}
        </div>
        <AddButton
          onClick={() =>
            updateList("projects", [
              ...cv.projects,
              {
                id: newId(),
                name: "",
                description: "",
                technologies: [],
                highlights: [],
              },
            ])
          }
        >
          Add project
        </AddButton>
      </Accordion>

      <Accordion
        title="Languages"
        icon={<Languages className="size-4" />}
        badge={cv.languages.length}
      >
        <div className="space-y-3">
          {cv.languages.map((item, index) => (
            <div
              key={item.id}
              {...langDrag.getDragProps(index)}
              className={cn(
                "grid min-w-0 items-end gap-2.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 sm:grid-cols-2",
                langDrag.getDragClasses(index)
              )}
            >
              <div className="col-span-full flex items-center justify-between border-b border-slate-200/70 pb-2">
                <span
                  className="flex cursor-grab items-center gap-1.5 text-xs font-bold text-slate-700 active:cursor-grabbing"
                  title="Drag to reorder"
                >
                  <GripVertical className="size-3.5 text-slate-400" />
                  {item.language || `Language ${index + 1}`}
                </span>
                <ItemActions
                  index={index}
                  count={cv.languages.length}
                  onMove={(direction) => move("languages", index, direction)}
                  onRemove={() => remove("languages", index)}
                />
              </div>
              <Field
                label="Language"
                value={item.language}
                onChange={(language) =>
                  updateList(
                    "languages",
                    cv.languages.map((entry) =>
                      entry.id === item.id ? { ...entry, language } : entry
                    )
                  )
                }
              />
              <SelectField
                label="CEFR level"
                value={item.proficiency}
                options={["A1", "A2", "B1", "B2", "C1", "C2"]}
                onChange={(proficiency) =>
                  updateList(
                    "languages",
                    cv.languages.map((entry) =>
                      entry.id === item.id
                        ? {
                            ...entry,
                            proficiency:
                              proficiency as LanguageItem["proficiency"],
                          }
                        : entry
                    )
                  )
                }
              />
              <div className="col-span-full">
                <Field
                  label="Certification"
                  value={item.certification}
                  onChange={(certification) =>
                    updateList(
                      "languages",
                      cv.languages.map((entry) =>
                        entry.id === item.id
                          ? { ...entry, certification }
                          : entry
                      )
                    )
                  }
                />
              </div>
            </div>
          ))}
        </div>
        <AddButton
          onClick={() =>
            updateList("languages", [
              ...cv.languages,
              { id: newId(), language: "", proficiency: "B1" },
            ])
          }
        >
          Add language
        </AddButton>
      </Accordion>

      <Accordion
        title="Custom Sections"
        icon={<Award className="size-4" />}
        badge={cv.customSections.length}
      >
        <div className="space-y-3.5">
          {cv.customSections.map((section, index) => (
            <div
              key={section.id}
              {...customDrag.getDragProps(index)}
              className={cn(
                "space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5",
                customDrag.getDragClasses(index)
              )}
            >
              <div className="flex items-end justify-between gap-2">
                <span
                  title="Drag to reorder"
                  className="mb-2.5 cursor-grab text-slate-400 hover:text-slate-600 active:cursor-grabbing"
                >
                  <GripVertical className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <Field
                    label="Section title"
                    value={section.title}
                    onChange={(title) =>
                      update({
                        customSections: cv.customSections.map((entry) =>
                          entry.id === section.id ? { ...entry, title } : entry
                        ),
                      })
                    }
                  />
                </div>
                <ItemActions
                  index={index}
                  count={cv.customSections.length}
                  onMove={(direction) =>
                    update({
                      customSections: reorderArray(
                        cv.customSections,
                        index,
                        index + direction
                      ),
                    })
                  }
                  onRemove={() =>
                    update({
                      customSections: cv.customSections.filter(
                        (entry) => entry.id !== section.id
                      ),
                    })
                  }
                />
              </div>
              {section.items.map((entry, itemIndex) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-2 rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-2xs"
                >
                  <div className="grid min-w-0 flex-1 gap-2.5 sm:grid-cols-2">
                    <Field
                      label="Item title"
                      value={entry.title}
                      onChange={(title) =>
                        update({
                          customSections: cv.customSections.map((current) =>
                            current.id === section.id
                              ? {
                                  ...current,
                                  items: current.items.map((item) =>
                                    item.id === entry.id
                                      ? { ...item, title }
                                      : item
                                  ),
                                }
                              : current
                          ),
                        })
                      }
                    />
                    <Field
                      label="Details"
                      value={entry.content}
                      multiline
                      onChange={(content) =>
                        update({
                          customSections: cv.customSections.map((current) =>
                            current.id === section.id
                              ? {
                                  ...current,
                                  items: current.items.map((item) =>
                                    item.id === entry.id
                                      ? { ...item, content }
                                      : item
                                  ),
                                }
                              : current
                          ),
                        })
                      }
                    />
                  </div>
                  <ItemActions
                    index={itemIndex}
                    count={section.items.length}
                    onMove={(direction) =>
                      update({
                        customSections: cv.customSections.map((current) =>
                          current.id === section.id
                            ? {
                                ...current,
                                items: reorderArray(
                                  current.items,
                                  itemIndex,
                                  itemIndex + direction
                                ),
                              }
                            : current
                        ),
                      })
                    }
                    onRemove={() =>
                      update({
                        customSections: cv.customSections.map((current) =>
                          current.id === section.id
                            ? {
                                ...current,
                                items: current.items.filter(
                                  (item) => item.id !== entry.id
                                ),
                              }
                            : current
                        ),
                      })
                    }
                  />
                </div>
              ))}
              <AddButton
                onClick={() =>
                  update({
                    customSections: cv.customSections.map((current) =>
                      current.id === section.id
                        ? {
                            ...current,
                            items: [
                              ...current.items,
                              { id: newId(), title: "", content: "" },
                            ],
                          }
                        : current
                    ),
                  })
                }
              >
                Add item
              </AddButton>
            </div>
          ))}
        </div>
        <AddButton
          onClick={() =>
            update({
              customSections: [
                ...cv.customSections,
                { id: newId(), title: "New Section", items: [] },
              ],
            })
          }
        >
          Add custom section
        </AddButton>
      </Accordion>
    </div>
  );
}

function DesignEditor({
  cv,
  update,
}: {
  cv: CVProfile;
  update: (updates: Partial<CVProfile>) => void;
}) {
  const templates: Array<{
    value: CVTemplate;
    label: string;
    description: string;
  }> = [
    {
      value: "europass",
      label: "Europass",
      description: "EU standard & structured",
    },
    {
      value: "modern",
      label: "Modern",
      description: "2-column visual sidebar",
    },
    {
      value: "ats",
      label: "ATS Minimalist",
      description: "Clean & parser-friendly",
    },
  ];
  const colors = [
    "#2563eb",
    "#4f46e5",
    "#7c3aed",
    "#0891b2",
    "#059669",
    "#dc2626",
    "#d97706",
    "#18181b",
  ];
  const updateSettings = (settings: Partial<CVProfile["settings"]>) =>
    update({ settings: { ...cv.settings, ...settings } });

  const sectionDrag = useDragReorder((from, to) =>
    updateSettings({
      sectionOrder: reorderArray(cv.settings.sectionOrder, from, to),
    })
  );

  const moveSection = (index: number, direction: -1 | 1) => {
    updateSettings({
      sectionOrder: reorderArray(
        cv.settings.sectionOrder,
        index,
        index + direction
      ),
    });
  };

  return (
    <div className="min-w-0 space-y-5">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
        <div className="mb-3 flex items-center gap-2">
          <LayoutTemplate className="size-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Template Style</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {templates.map((template) => {
            const isSelected = cv.settings.template === template.value;
            return (
              <button
                key={template.value}
                type="button"
                onClick={() => updateSettings({ template: template.value })}
                className={cn(
                  "group relative rounded-xl border p-3 text-left transition-all",
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                )}
              >
                {isSelected && (
                  <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xs">
                    <Check className="size-3" />
                  </span>
                )}
                <div className="mb-2.5 h-16 overflow-hidden rounded-lg border border-slate-200/80 bg-white p-1.5 shadow-2xs">
                  {template.value === "modern" ? (
                    <div className="grid h-full grid-cols-[32%_1fr] gap-1.5">
                      <div
                        className="rounded-xs p-1"
                        style={{
                          backgroundColor: cv.settings.accentColor || "#2563eb",
                        }}
                      >
                        <div className="h-1.5 w-4/5 rounded bg-white/80" />
                        <div className="mt-1 h-1 w-3/5 rounded bg-white/50" />
                      </div>
                      <div className="space-y-1 p-0.5">
                        <div className="h-1.5 w-3/4 rounded bg-slate-300" />
                        <div className="h-1 w-full rounded bg-slate-200" />
                        <div className="h-1 w-5/6 rounded bg-slate-200" />
                      </div>
                    </div>
                  ) : template.value === "europass" ? (
                    <div className="space-y-1.5 p-0.5">
                      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1">
                        <div className="size-3 rounded-full bg-slate-300" />
                        <div className="h-1.5 w-1/2 rounded bg-slate-400" />
                      </div>
                      <div className="grid grid-cols-[28%_1fr] gap-1">
                        <div className="h-1 w-full rounded bg-indigo-200" />
                        <div className="h-1 w-full rounded bg-slate-200" />
                      </div>
                      <div className="grid grid-cols-[28%_1fr] gap-1">
                        <div className="h-1 w-full rounded bg-indigo-200" />
                        <div className="h-1 w-4/5 rounded bg-slate-200" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5 p-0.5">
                      <div className="mx-auto h-1.5 w-1/2 rounded bg-slate-400" />
                      <div className="h-px w-full bg-slate-300" />
                      <div className="h-1 w-full rounded bg-slate-200" />
                      <div className="h-1 w-5/6 rounded bg-slate-200" />
                      <div className="h-1 w-3/4 rounded bg-slate-200" />
                    </div>
                  )}
                </div>
                <div className="text-xs font-bold text-slate-900">
                  {template.label}
                </div>
                <div className="mt-0.5 text-[11px] leading-tight text-slate-500">
                  {template.description}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
        <div>
          <div className="mb-2.5 flex items-center gap-2">
            <Palette className="size-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Accent Color</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {colors.map((color) => {
              const active =
                cv.settings.accentColor.toLowerCase() === color.toLowerCase();
              return (
                <button
                  key={color}
                  type="button"
                  aria-label={`Use ${color}`}
                  onClick={() => updateSettings({ accentColor: color })}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full border-2 border-white shadow-xs ring-1 ring-slate-200 transition hover:scale-110",
                    active && "scale-110 ring-2 ring-indigo-600 ring-offset-1"
                  )}
                  style={{ backgroundColor: color }}
                >
                  {active && <Check className="size-3.5 text-white" />}
                </button>
              );
            })}

            <label className="ml-auto flex h-8 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/70 px-2 text-xs font-medium text-slate-700 transition hover:border-slate-300">
              <input
                type="color"
                aria-label="Pick custom color"
                value={
                  /^#[0-9A-Fa-f]{6}$/.test(cv.settings.accentColor)
                    ? cv.settings.accentColor
                    : "#2563eb"
                }
                onChange={(event) =>
                  updateSettings({ accentColor: event.target.value })
                }
                className="size-4 cursor-pointer rounded border-0 bg-transparent p-0"
              />
              <input
                aria-label="Custom accent hex"
                type="text"
                value={cv.settings.accentColor}
                onChange={(event) =>
                  updateSettings({ accentColor: event.target.value })
                }
                className="w-16 bg-transparent font-mono text-xs text-slate-800 outline-none"
              />
            </label>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3.5">
          <div className="mb-2 flex items-center gap-2">
            <Type className="size-4 text-indigo-600" />
            <span className="text-sm font-bold text-slate-900">Typography</span>
          </div>
          <SelectField
            label="Font family"
            value={cv.settings.fontFamily}
            options={["inter", "jakarta", "roboto", "merriweather"]}
            onChange={(fontFamily) =>
              updateSettings({
                fontFamily: fontFamily as CVProfile["settings"]["fontFamily"],
              })
            }
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Section Order</h3>
          </div>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
            Drag to reorder
          </span>
        </div>
        <div className="space-y-2">
          {cv.settings.sectionOrder.map((section, index) => {
            const meta = sectionMeta[section];
            return (
              <div
                key={section}
                {...sectionDrag.getDragProps(index)}
                className={cn(
                  "flex cursor-grab items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-2 text-sm hover:border-slate-300 hover:bg-white active:cursor-grabbing",
                  sectionDrag.getDragClasses(index)
                )}
              >
                <span className="flex items-center gap-2.5 font-medium text-slate-700">
                  <GripVertical className="size-4 text-slate-300" />
                  {meta.icon}
                  <span className="text-xs font-semibold">{meta.label}</span>
                </span>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveSection(index, -1)}
                    aria-label="Move section up"
                    className="rounded-md p-1 text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-900 disabled:opacity-30"
                  >
                    <ChevronUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === cv.settings.sectionOrder.length - 1}
                    onClick={() => moveSection(index, 1)}
                    aria-label="Move section down"
                    className="rounded-md p-1 text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-900 disabled:opacity-30"
                  >
                    <ChevronDown className="size-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function EditorPanel({ className }: { className?: string }) {
  const {
    activeCV,
    isLoaded,
    createProfile,
    loadSampleData,
    updateActiveCV,
  } = useCV();
  const [tab, setTab] = useState<Tab>("content");
  if (!isLoaded || !activeCV)
    return (
      <aside
        className={cn(
          "editor-panel flex h-full min-w-0 flex-col items-center justify-start border-r border-slate-200/80 bg-slate-100/60 print:hidden px-4 py-6",
          className
        )}
      >
        <div className="flex max-w-sm w-full flex-col items-center gap-4 text-center pt-22">
          <FileText className="size-8 text-slate-400" />
          <div>
            <h3 className="text-base font-semibold text-slate-900 tracking-tight">
              No CV profile loaded
            </h3>
            <p className="mt-1 text-sm text-slate-500 leading-relaxed">
              Create or select a CV profile to start editing.
            </p>
          </div>
          <div
            className={cn(
              "flex w-full flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3",
              isLoaded ? "" : "opacity-70"
            )}
          >
            <button
              type="button"
              onClick={() => createProfile()}
              disabled={!isLoaded}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-all disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]"
            >
              <Plus className="size-4" />
              New CV
            </button>
            <button
              type="button"
              onClick={() => loadSampleData()}
              disabled={!isLoaded}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 bg-white shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-all disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]"
            >
              <Sparkles className="size-4 text-amber-500" />
              Load Sample
            </button>
          </div>
        </div>
      </aside>
    );
  const update = (updates: Partial<CVProfile>) => updateActiveCV(updates);
  return (
    <aside
      className={cn(
        "editor-panel flex w-full min-w-0 flex-col border-r border-slate-200/80 bg-slate-100/60 print:hidden",
        className
      )}
    >
      <div className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-md">
        <div className="grid grid-cols-2 rounded-xl border border-slate-200/80 bg-slate-100/80 p-1">
          <button
            type="button"
            onClick={() => setTab("content")}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all",
              tab === "content"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            <FileText className="size-3.5" />
            Content
          </button>
          <button
            type="button"
            onClick={() => setTab("design")}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all",
              tab === "design"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            <Sparkles className="size-3.5" />
            Design & Layout
          </button>
        </div>
      </div>

      <div className="min-w-0 flex-1 overflow-y-auto p-4">
        {tab === "content" ? (
          <ContentEditor cv={activeCV} update={update} />
        ) : (
          <DesignEditor cv={activeCV} update={update} />
        )}
      </div>
    </aside>
  );
}
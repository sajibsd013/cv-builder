"use client";

import { useRef } from "react";
import { Bold, Italic, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextField({ label, value, onChange, placeholder, className }: RichTextFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const classes = "min-h-24 w-full resize-y rounded-b-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  const transformSelection = (transform: (selected: string) => string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextValue = `${value.slice(0, start)}${transform(value.slice(start, end))}${value.slice(end)}`;
    onChange(nextValue);
    requestAnimationFrame(() => {
      textarea.focus();
      const nextEnd = start + transform(value.slice(start, end)).length;
      textarea.setSelectionRange(start, nextEnd);
    });
  };

  const wrap = (marker: "**" | "*") => transformSelection((selected) => `${marker}${selected || "text"}${marker}`);
  const bullet = () => transformSelection((selected) => {
    const content = selected || "";
    return content.split("\n").map((line) => (line.startsWith("• ") ? line : `• ${line}`)).join("\n");
  });

  return (
    <label className={cn("block min-w-0 space-y-1", className)}>
      <span className="text-xs font-medium text-zinc-600">{label}</span>
      <span className="flex items-center gap-1 rounded-t-lg border border-b-0 border-slate-200 bg-slate-50 p-1">
        <button type="button" aria-label="Bold" title="Bold" onClick={() => wrap("**")} className="flex min-h-8 min-w-8 items-center justify-center rounded text-slate-600 hover:bg-white hover:text-slate-900"><Bold className="size-4" /></button>
        <button type="button" aria-label="Italic" title="Italic" onClick={() => wrap("*")} className="flex min-h-8 min-w-8 items-center justify-center rounded text-slate-600 hover:bg-white hover:text-slate-900"><Italic className="size-4" /></button>
        <button type="button" aria-label="Bullet list" title="Bullet list" onClick={bullet} className="flex min-h-8 min-w-8 items-center justify-center rounded text-slate-600 hover:bg-white hover:text-slate-900"><List className="size-4" /></button>
      </span>
      <textarea ref={textareaRef} className={classes} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

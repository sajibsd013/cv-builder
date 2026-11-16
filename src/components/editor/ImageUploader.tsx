"use client";

import { useId, useState, type ChangeEvent, type DragEvent } from "react";
import Image from "next/image";
import { Camera, Circle, RotateCcw, Square, X } from "lucide-react";
import { compressImage } from "@/lib/imageCompressor";
import { cn } from "@/lib/utils";

export type ImageShape = "circle" | "square";

interface ImageUploaderProps {
  photo?: string;
  onPhotoChange: (photo?: string) => void;
  shape?: ImageShape;
  onShapeChange?: (shape: ImageShape) => void;
  className?: string;
}

export function ImageUploader({
  photo,
  onPhotoChange,
  shape,
  onShapeChange,
  className,
}: ImageUploaderProps) {
  const inputId = useId();
  const [internalShape, setInternalShape] = useState<ImageShape>("circle");
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedShape = shape ?? internalShape;

  const processFile = async (file?: File) => {
    if (!file) return;
    setError(null);
    setIsCompressing(true);
    try {
      const compressedPhoto = await compressImage(file);
      onPhotoChange(compressedPhoto);
    } catch (compressionError) {
      setError(
        compressionError instanceof Error
          ? compressionError.message
          : "The image could not be uploaded."
      );
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    await processFile(file);
  };

  const handleDrop = async (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    await processFile(file);
  };

  const handleShapeSelect = (nextShape: ImageShape) => {
    setInternalShape(nextShape);
    onShapeChange?.(nextShape);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-3">
        {/* বামপাশ: ইমেজ প্রিভিউ + ক্লিক/ড্রপ আপলোড */}
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="relative shrink-0">
            <label
              htmlFor={inputId}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              title={photo ? "Click or drop to change photo" : "Click or drop to upload photo"}
              className={cn(
                "group relative flex size-20 cursor-pointer items-center justify-center overflow-hidden border-2 border-dashed border-zinc-300 bg-white transition-all hover:border-zinc-900",
                selectedShape === "circle" ? "rounded-full" : "rounded-2xl",
                photo && "border-solid border-zinc-200",
                isDragging && "scale-105 border-zinc-900 bg-zinc-100",
                isCompressing && "pointer-events-none opacity-60"
              )}
            >
              {photo ? (
                <>
                  <Image
                    src={photo}
                    alt="Profile photo"
                    width={80}
                    height={80}
                    unoptimized
                    className="size-full object-cover"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera className="mb-0.5 size-4" />
                    Change
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-zinc-400 transition-colors group-hover:text-zinc-800">
                  <Camera className="size-5" />
                  <span className="mt-1 text-[10px] font-medium">
                    {isCompressing ? "Wait..." : "Upload"}
                  </span>
                </div>
              )}
            </label>

            <input
              id={inputId}
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={isCompressing}
              onChange={handleFileChange}
            />

            {/* ছবি রিমুভ করার জন্য কোণায় ছোট ব্যাজ বাটন */}
            {photo && (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  onPhotoChange(undefined);
                }}
                aria-label="Remove photo"
                title="Remove photo"
                className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-sm transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="min-w-0">
            <label
              htmlFor={inputId}
              className="block cursor-pointer truncate text-sm font-medium text-zinc-800 hover:underline"
            >
              {isCompressing
                ? "Compressing image..."
                : photo
                  ? "Profile photo"
                  : "Add profile photo"}
            </label>
            <p className="mt-0.5 text-xs text-zinc-500">
              Click or drop JPEG/PNG (auto-300px)
            </p>
          </div>
        </div>

        {/* ডানপাশ: কম্প্যাক্ট সেগমেন্টেড শেপ সুইচার */}
        <div
          role="group"
          aria-label="Photo shape"
          className="inline-flex shrink-0 rounded-lg border border-zinc-200 bg-white p-0.5 shadow-2xs"
        >
          <button
            type="button"
            aria-pressed={selectedShape === "circle"}
            onClick={() => handleShapeSelect("circle")}
            title="Circle shape"
            className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all",
              selectedShape === "circle"
                ? "bg-zinc-900 text-white shadow-2xs"
                : "text-zinc-600 hover:text-zinc-900"
            )}
          >
            <Circle className="size-3.5" />
            <span className="hidden sm:inline">Circle</span>
          </button>
          <button
            type="button"
            aria-pressed={selectedShape === "square"}
            onClick={() => handleShapeSelect("square")}
            title="Rounded square shape"
            className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all",
              selectedShape === "square"
                ? "bg-zinc-900 text-white shadow-2xs"
                : "text-zinc-600 hover:text-zinc-900"
            )}
          >
            <Square className="size-3.5" />
            <span className="hidden sm:inline">Square</span>
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-1.5 text-xs text-red-600">
          <RotateCcw className="size-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
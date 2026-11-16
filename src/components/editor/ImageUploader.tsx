"use client";

import { useId, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { Circle, ImagePlus, RotateCcw, Square, Trash2 } from "lucide-react";
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
  const [error, setError] = useState<string | null>(null);
  const selectedShape = shape ?? internalShape;

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
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
          : "The image could not be uploaded.",
      );
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemove = () => {
    setError(null);
    onPhotoChange(undefined);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex size-24 shrink-0 items-center justify-center overflow-hidden border border-zinc-200 bg-zinc-100",
            selectedShape === "circle" ? "rounded-full" : "rounded-xl",
          )}
        >
          {photo ? (
            <Image
              src={photo}
              alt="Profile photo preview"
              width={96}
              height={96}
              unoptimized
              className="size-full object-cover"
            />
          ) : (
            <ImagePlus className="size-7 text-zinc-400" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap gap-2">
            <label
              htmlFor={inputId}
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700",
                isCompressing && "cursor-wait opacity-60",
              )}
            >
              <ImagePlus className="size-4" aria-hidden="true" />
              {isCompressing ? "Processing..." : photo ? "Change photo" : "Upload photo"}
            </label>
            <input
              id={inputId}
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={isCompressing}
              onChange={handleFileChange}
            />
            {photo && (
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-zinc-500">JPEG or PNG, automatically compressed to 300px.</p>
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-zinc-700">Photo shape</legend>
        <div className="flex gap-2">
          <button
            type="button"
            aria-pressed={selectedShape === "circle"}
            onClick={() => {
              setInternalShape("circle");
              onShapeChange?.("circle");
            }}
            className={cn(
              "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
              selectedShape === "circle"
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-200 text-zinc-700 hover:bg-zinc-50",
            )}
          >
            <Circle className="size-4" aria-hidden="true" />
            Circular
          </button>
          <button
            type="button"
            aria-pressed={selectedShape === "square"}
            onClick={() => {
              setInternalShape("square");
              onShapeChange?.("square");
            }}
            className={cn(
              "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
              selectedShape === "square"
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-200 text-zinc-700 hover:bg-zinc-50",
            )}
          >
            <Square className="size-4" aria-hidden="true" />
            Rounded square
          </button>
        </div>
      </fieldset>

      {error && (
        <div role="alert" className="flex items-center gap-2 text-sm text-red-600">
          <RotateCcw className="size-4" aria-hidden="true" />
          {error}
        </div>
      )}
    </div>
  );
}

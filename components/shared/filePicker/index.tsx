"use client";

import { ReactNode, useRef, useState } from "react";
import Image from "next/image";
import { FaTrash, FaUser } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FilePickerProps {
  value?: string | null;
  onChange: (file: File | null) => void;
  onClear?: () => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
  imageClassName?: string;
  previewClassName?: string;
  imageDescribtion?: ReactNode;
  defaultImage?: ReactNode;
}

export function FilePicker({
  value,
  onChange,
  onClear,
  imageDescribtion,
  defaultImage = (
    <div
      className={cn(
        "w-16 md:w-20 h-16 md:h-20 text-lg md:text-2xl rounded-full bg-primary-700/40 flex items-center justify-center",
      )}
    >
      <FaUser />
    </div>
  ),
  accept = "image/*",
  maxSizeMB = 5,
  className,
  previewClassName,
  imageClassName,
}: FilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File | null) => {
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`The maximum file size must be less than ${maxSizeMB}MB.`);
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Only image files atr allowed.");
      return;
    }

    setPreview(URL.createObjectURL(file));
    onChange(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    handleFile(file);
  };

  const clearFile = () => {
    setPreview(null);
    onChange(null);
    onClear?.();
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div
      className={cn(
        "relative border border-primary-700 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors",
        dragOver
          ? "border-secondary-500 bg-secondary-500/10"
          : "hover:bg-primary-400/50",
        className,
      )}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0] ?? null;
        handleFile(file);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
      />

      {preview ? (
        <div
          className={cn(
            "relative w-16 md:w-20 h-16 md:h-20 rounded-lg",
            previewClassName,
          )}
        >
          <Image
            src={preview}
            loading="eager"
            alt="preview"
            width={300}
            height={300}
            className={cn("object-cover h-full w-full", imageClassName)}
          />
          {/* 
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearFile();
            }}
            className="absolute cursor-pointer -top-1 -right-1 bg-primary-600 text-light rounded-full p-1 shadow "
          >
            <FaTrash size={12} />
          </button> */}
          <Button
            size="icon"
            variant="outline"
            className="absolute -bottom-2 -right-1.5 rounded-full h-8 w-8 bg-background shadow-sm"
          >
            <FaTrash size={14} />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-primary-400">
          {defaultImage}
          {imageDescribtion}
        </div>
      )}
    </div>
  );
}

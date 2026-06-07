"use client";

import { JSX, useRef, useState } from "react";
import Image from "next/image";
import { FaTrash, FaUser, FaRegFilePdf } from "react-icons/fa6";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { HiDocumentText } from "react-icons/hi2";
import { cn } from "@/lib/utils";

type Mode = "image" | "images" | "document" | "documents" | "dropzone";

interface Props {
  mode?: Mode;
  value?: string | null;
  onChange: (file: File | File[] | null) => void;
  accept?: string;
  maxSizeMB?: number;
  maxFiles?: number;
  className?: string;
}

const docIcons: Record<string, JSX.Element> = {
  "application/pdf": <FaRegFilePdf className="text-red-500 w-6" size={20} />,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": (
    <HiDocumentText className="text-blue-500 w-6" size={20} />
  ),
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": (
    <PiMicrosoftExcelLogoFill className="text-green-500 w-6" size={20} />
  ),
};

export function FileUploader({
  mode = "image",
  value,
  onChange,
  accept = "image/*",
  maxSizeMB = 5,
  maxFiles = 3,
  className,
}: Props) {
  const ref = useRef<HTMLInputElement>(null);

  const [drag, setDrag] = useState(false);
  const [preview, setPreview] = useState<string | null>(value ?? null); // form image mode - view
  const [previews, setPreviews] = useState<string[]>([]); // for images mode - view
  const [imgFiles, setImgFiles] = useState<File[]>([]); // for images/image mode - files
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [error, setError] = useState("");

  const validate = (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Max size ${maxSizeMB}MB`);
      return false;
    }
    return true;
  };

  const handleMultipleDocuments = (incoming: FileList | null) => {
    if (!incoming) return;

    const updated = [...docFiles];

    for (let file of Array.from(incoming)) {
      if (updated.length >= maxFiles) {
        setError(`You cannot upload more than ${maxFiles} files.`);
        break;
      }
      if (file.type.startsWith("image")) {
        setError("You cannot upload image files.");
        break;
      }
      if (!validate(file)) continue;

      updated.push(file);
      setError("");
    }

    setDocFiles(updated);
    onChange(updated);
  };

  const handleSingleImage = (file: File | null) => {
    if (!file || !validate(file)) return;

    if (!file.type.startsWith("image")) {
      setError("You can only upload image files.");
      return;
    }
    setError("");
    setPreview(URL.createObjectURL(file));
    setImgFiles([file]);
    onChange(file);
  };
  const handleSingleDocument = (file: File | null) => {
    if (!file || !validate(file)) return;

    if (file.type.startsWith("image")) {
      setError("You cannot upload image files.");
      return;
    }
    setError("");
    setDocFiles([file]);
    onChange(file);
  };

  const handleMultipleImages = (incoming: FileList | null) => {
    if (!incoming) return;

    const updated = [...imgFiles];
    const previewUpdated = [...previews];

    for (let file of Array.from(incoming)) {
      if (updated.length >= maxFiles) {
        setError(`You cannot upload more than ${maxFiles} images.`);
        break;
      }
      if (!file.type.startsWith("image")) {
        setError("You can only upload image files.");
        break;
      }

      if (!validate(file)) continue;

      updated.push(file);
      previewUpdated.push(URL.createObjectURL(file));
      setError("");
    }

    setImgFiles(updated);
    setPreviews(previewUpdated);
    onChange(updated);
  };

  const handleRemoveImages = (i: number) => {
    const updated = (mode === "images" ? imgFiles : docFiles).filter(
      (_, index) => index !== i,
    );
    const previewUpdated = previews.filter((_, index) => index !== i);

    mode === "images" ? setImgFiles(updated) : setDocFiles(updated);
    setPreviews(previewUpdated);
    onChange(updated);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;

    if (mode === "images") handleMultipleImages(fileList);
    else if (mode === "documents") handleMultipleDocuments(fileList);
    else if (mode === "document") handleSingleDocument(fileList?.[0] ?? null);
    else handleSingleImage(fileList?.[0] ?? null);
  };

  return (
    <div
      className={cn(
        "border border-dashed rounded-xl p-4 flex flex-col gap-2 items-center justify-center transition",
        drag
          ? "bg-blue-500/10 border-blue-500 cursor-pointer"
          : previews.length < maxFiles &&
              docFiles.length < maxFiles &&
              "cursor-pointer hover:bg-gray-800/10",
        className,
      )}
      onClick={() =>
        previews.length < maxFiles &&
        docFiles.length < maxFiles &&
        ref.current?.click()
      }
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        if (previews.length > maxFiles || docFiles.length > maxFiles) return;
        setDrag(false);

        if (mode === "images") handleMultipleImages(e.dataTransfer.files);
        else if (mode === "documents")
          handleMultipleDocuments(e.dataTransfer.files);
        else if (mode === "document")
          handleSingleDocument(e.dataTransfer.files?.[0] ?? null);
        else handleSingleImage(e.dataTransfer.files?.[0] ?? null);
      }}
    >
      <input
        ref={ref}
        type="file"
        accept={accept}
        multiple={mode === "images" || mode === "documents"}
        className="hidden"
        onChange={handleInput}
      />

      {/* single image */}
      {mode === "image" && preview && (
        <div className="relative w-20 h-20">
          <Image
            src={preview}
            fill
            alt=""
            className="object-cover rounded-lg"
          />
          <button
            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
            onClick={(e) => {
              e.stopPropagation();
              setPreview(null);
              onChange(null);
              setError("");
            }}
          >
            <FaTrash size={12} />
          </button>
        </div>
      )}

      {/* multiple */}
      {mode === "images" && previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((src, i) => (
            <div key={i} className="relative w-20 h-20">
              <Image
                src={src}
                fill
                alt=""
                className="object-cover rounded-lg bg-primary-100 border border-border"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImages(i);
                  setError("");
                }}
                className="absolute -top-2 -right-2 bg-error text-light rounded-full p-1"
              >
                <FaTrash size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {mode === "documents" && docFiles.length > 0 && (
        <div className="flex flex-col gap-2 w-full">
          {docFiles.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-1 justify-between bg-primary-300 rounded px-3 py-2"
            >
              <div className="flex items-center gap-1">
                {docIcons[file.type] ?? "📄"}
                <span className="text-sm text-primary-600">{file.name}</span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const updated = docFiles.filter((_, index) => index !== i);
                  setDocFiles(updated);
                  onChange(updated);
                  setError("");
                }}
                className="text-error cursor-pointer"
              >
                <FaTrash size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* document */}
      {mode === "document" && docFiles.length > 0 && (
        <div className="flex items-center gap-2 justify-between bg-primary-300 rounded px-3 py-2">
          <div className="flex items-center gap-1">
            {docIcons[docFiles[0].type] ?? "📄"}
            <span className="text-sm text-primary-600">{docFiles[0].name}</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setDocFiles([]);
              onChange(null);
              setError("");
            }}
            className="text-error cursor-pointer"
          >
            <FaTrash size={14} />
          </button>
        </div>
      )}

      {/* placeholder */}
      {!preview &&
        previews.length < maxFiles &&
        ((mode === "documents" && docFiles.length < maxFiles) ||
          (mode === "document" && docFiles.length === 0)) && (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <FaUser size={30} />
            <p className="text-sm">Click or drag file</p>
          </div>
        )}
      {error && <span className="text-error">{error}</span>}
    </div>
  );
}

"use client";

import { useRef } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface LogoUploaderProps {
  value?: string | File | null;
  onChange: (file: File | null) => void;
  defaultImage?: string;
  className?: string;
}

export function LogoUploader({
  value,
  onChange,
  defaultImage,
  className,
}: LogoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // Determine what to display
  let displayUrl = defaultImage;

  if (value instanceof File) {
    displayUrl = URL.createObjectURL(value);
  } else if (typeof value === "string" && value) {
    displayUrl = value;
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div
        onClick={handleClick}
        className="relative group cursor-pointer w-32 h-32 rounded-full border-2 border-muted-foreground/25 hover:border-primary transition-colors flex items-center justify-center overflow-hidden bg-muted/10"
      >
        <Avatar className="w-full h-full">
          <AvatarImage src={displayUrl || undefined} className="object-cover" />
          <AvatarFallback className="bg-transparent">
            <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
          </AvatarFallback>
        </Avatar>

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <p className="text-white text-xs font-medium">Change Logo</p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".png, .jpg, .jpeg, .webp"
          className="hidden"
          max={2_000_000}
          onChange={handleFileChange}
        />
      </div>

      {value instanceof File && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-fit text-destructive hover:text-destructive/90"
          onClick={handleRemove}
        >
          <X className="w-4 h-4 mr-2" />
          Remove Logo
        </Button>
      )}
    </div>
  );
}

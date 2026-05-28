"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UseFormReturn } from "react-hook-form";
import { Upload, X, GripVertical, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { createAssetSchema } from "@/types/seller-asset";

interface ImagesFormProps {
  form: UseFormReturn<z.input<typeof createAssetSchema>>;
}

export function ImagesForm({ form }: ImagesFormProps) {
  const [uploading, setUploading] = useState(false);
  const images = form.watch("images") || [];

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true);
      try {
        for (const file of acceptedFiles) {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/upload", { method: "POST", body: formData });
          if (res.ok) {
            const { url, key } = await res.json();
            const currentImages = form.getValues("images") || [];
            form.setValue("images", [
              ...currentImages,
              { url, key, alt: "", sortOrder: currentImages.length, isThumbnail: currentImages.length === 0 },
            ]);
          }
        }
      } catch {
        console.error("Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [form],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    multiple: true,
  });

  const removeImage = (index: number) => {
    const current = form.getValues("images") || [];
    const updated = current.filter((_, i) => i !== index);
    form.setValue("images", updated);
  };

  const setThumbnail = (index: number) => {
    const current = form.getValues("images") || [];
    const updated = current.map((img, i) => ({ ...img, isThumbnail: i === index }));
    form.setValue("images", updated);
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const current = [...images];
    const [moved] = current.splice(from, 1);
    current.splice(to, 0, moved);
    const reordered = current.map((img, i) => ({ ...img, sortOrder: i }));
    form.setValue("images", reordered);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Images</h3>
      <FormField
        control={form.control}
        name="images"
        render={() => (
          <FormItem>
            <FormControl>
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                  isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50",
                )}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {isDragActive ? "Drop images here" : "Drag & drop images, or click to select"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP up to 10MB each</p>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {images.length > 0 && (
        <div className="space-y-2">
          {images.map((img, index) => (
            <div key={index} className="flex items-center gap-3 rounded-md border p-3">
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
              <img src={img.url} alt={img.alt || ""} className="h-12 w-12 rounded object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{img.key}</p>
                <p className="text-xs text-muted-foreground">Sort: {img.sortOrder}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", img.isThumbnail && "text-amber-500")}
                onClick={() => setThumbnail(index)}
              >
                <Star className={cn("h-4 w-4", img.isThumbnail && "fill-current")} />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveImage(index, index - 1)}>
                ↑
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveImage(index, index + 1)}>
                ↓
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeImage(index)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
    </div>
  );
}

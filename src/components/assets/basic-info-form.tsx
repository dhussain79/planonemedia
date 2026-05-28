"use client";

import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { createAssetSchema } from "@/types/seller-asset";

interface BasicInfoFormProps {
  form: UseFormReturn<z.input<typeof createAssetSchema>>;
}

const MEDIA_TYPES = [
  { value: "NEWSPAPER", label: "Newspaper" },
  { value: "MAGAZINE", label: "Magazine" },
  { value: "TV", label: "TV" },
  { value: "RADIO", label: "Radio" },
  { value: "OUTDOOR", label: "Outdoor" },
  { value: "ONLINE", label: "Online" },
  { value: "CINEMA", label: "Cinema" },
  { value: "OTHER", label: "Other" },
];

export function BasicInfoForm({ form }: BasicInfoFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Basic Information</h3>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title *</FormLabel>
            <FormControl>
              <Input placeholder="Asset title" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Describe your asset" rows={4} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="mediaType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Media Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {MEDIA_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="format"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Format</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Billboard, Full page" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

"use client";

import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { createAssetSchema } from "@/types/seller-asset";

interface SpecificationsFormProps {
  form: UseFormReturn<z.input<typeof createAssetSchema>>;
}

const ORIENTATIONS = ["Landscape", "Portrait", "Square", "Custom"];

export function SpecificationsForm({ form }: SpecificationsFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Specifications</h3>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="width"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Width (m)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  value={String(field.value ?? "")}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="height"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Height (m)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  value={String(field.value ?? "")}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="displayArea"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Area (m²)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  value={String(field.value ?? "")}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="resolution"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resolution</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 1920x1080" {...field} value={String(field.value ?? "")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="orientation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Orientation</FormLabel>
            <Select onValueChange={field.onChange} value={String(field.value ?? "")}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select orientation" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {ORIENTATIONS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex gap-6">
        <FormField
          control={form.control}
          name="isIlluminated"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <input type="checkbox" checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} className="h-4 w-4" />
              </FormControl>
              <FormLabel className="!mt-0">Illuminated</FormLabel>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="hasAudio"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <input type="checkbox" checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} className="h-4 w-4" />
              </FormControl>
              <FormLabel className="!mt-0">Has Audio</FormLabel>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isInteractive"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <input type="checkbox" checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} className="h-4 w-4" />
              </FormControl>
              <FormLabel className="!mt-0">Interactive</FormLabel>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

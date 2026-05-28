"use client";

import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { createAssetSchema } from "@/types/seller-asset";

interface LocationFormProps {
  form: UseFormReturn<z.input<typeof createAssetSchema>>;
}

export function LocationForm({ form }: LocationFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Location</h3>
      <FormField
        control={form.control}
        name="location.address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Input placeholder="Street address" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="location.city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City *</FormLabel>
              <FormControl>
                <Input placeholder="City" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location.country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country *</FormLabel>
              <FormControl>
                <Input placeholder="Country" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="location.governorate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Governorate</FormLabel>
            <FormControl>
              <Input placeholder="Governorate" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="location.lat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Latitude</FormLabel>
              <FormControl>
                <Input type="number" step="any" placeholder="e.g. 24.7136" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location.lng"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Longitude</FormLabel>
              <FormControl>
                <Input type="number" step="any" placeholder="e.g. 46.6753" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

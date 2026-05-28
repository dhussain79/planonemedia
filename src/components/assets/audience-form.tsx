"use client";

import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { createAssetSchema } from "@/types/seller-asset";

interface AudienceFormProps {
  form: UseFormReturn<z.input<typeof createAssetSchema>>;
}

export function AudienceForm({ form }: AudienceFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Audience</h3>
      <div className="grid grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="dailyImpressions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Daily Impressions</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={String(field.value ?? "")}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="monthlyImpressions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Impressions</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={String(field.value ?? "")}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="estimatedViews"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Views</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={String(field.value ?? "")}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="audienceDemographics"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Audience Demographics (JSON)</FormLabel>
            <FormControl>
              <Textarea
                placeholder='{"ageGroups": ["18-24", "25-34"], "gender": "all", "interests": ["tech", "luxury"]}'
                rows={5}
                value={field.value ? JSON.stringify(field.value, null, 2) : ""}
                onChange={(e) => {
                  try {
                    field.onChange(JSON.parse(e.target.value));
                  } catch {
                    field.onChange(e.target.value);
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

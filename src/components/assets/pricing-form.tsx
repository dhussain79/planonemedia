"use client";

import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { createAssetSchema } from "@/types/seller-asset";

interface PricingFormProps {
  form: UseFormReturn<z.input<typeof createAssetSchema>>;
}

const PRICING_MODELS = [
  { value: "CPM", label: "CPM (Cost per Mille)" },
  { value: "CPC", label: "CPC (Cost per Click)" },
  { value: "FLAT_RATE", label: "Flat Rate" },
  { value: "DYNAMIC", label: "Dynamic" },
];

export function PricingForm({ form }: PricingFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Pricing</h3>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="pricingModel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pricing Model</FormLabel>
              <Select onValueChange={field.onChange} value={String(field.value ?? "")}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PRICING_MODELS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
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
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <FormControl>
                <Input {...field} value={String(field.value ?? "")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="basePrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Base Price</FormLabel>
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
          name="minimumSpend"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Spend</FormLabel>
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
      <FormField
        control={form.control}
        name="slotGranularity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Slot Granularity</FormLabel>
            <FormControl>
              <Input placeholder="e.g. 15s, 30s, 60s" {...field} value={String(field.value ?? "")} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

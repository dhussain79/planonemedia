"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import { Form } from "@/components/ui/form";
import { BasicInfoForm } from "@/components/assets/basic-info-form";
import { LocationForm } from "@/components/assets/location-form";
import { SpecificationsForm } from "@/components/assets/specifications-form";
import { PricingForm } from "@/components/assets/pricing-form";
import { AudienceForm } from "@/components/assets/audience-form";
import { ImagesForm } from "@/components/assets/images-form";
import { z } from "zod";
import { createAssetSchema } from "@/types/seller-asset";
import { useCreateSellerAsset } from "@/hooks/use-seller-assets";

export default function NewAssetPage() {
  const router = useRouter();
  const createMutation = useCreateSellerAsset();
  const [activeTab, setActiveTab] = useState("basic");

  const form = useForm<z.input<typeof createAssetSchema>>({
    resolver: zodResolver(createAssetSchema),
    defaultValues: {
      title: "",
      description: "",
      mediaType: undefined,
      format: "",
      location: { city: "", country: "Saudi Arabia", address: "", governorate: "" },
      width: null,
      height: null,
      displayArea: null,
      resolution: "",
      orientation: "",
      isIlluminated: false,
      hasAudio: false,
      isInteractive: false,
      pricingModel: undefined,
      basePrice: null,
      currency: "SAR",
      minimumSpend: null,
      slotGranularity: "",
      dailyImpressions: null,
      monthlyImpressions: null,
      estimatedViews: null,
      audienceDemographics: null,
      images: [],
    },
  });

  const onSubmit = (data: z.input<typeof createAssetSchema>) => {
    createMutation.mutate(data, {
      onSuccess: (res) => {
        router.push(`/supplier/assets/${res.data.id}`);
      },
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Toaster />
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Asset</h1>
        <p className="text-muted-foreground">Fill in the details for your media asset</p>
      </div>

      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="specs">Specs</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="audience">Audience</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="mt-6">
                <BasicInfoForm form={form} />
              </TabsContent>
              <TabsContent value="location" className="mt-6">
                <LocationForm form={form} />
              </TabsContent>
              <TabsContent value="specs" className="mt-6">
                <SpecificationsForm form={form} />
              </TabsContent>
              <TabsContent value="pricing" className="mt-6">
                <PricingForm form={form} />
              </TabsContent>
              <TabsContent value="audience" className="mt-6">
                <AudienceForm form={form} />
              </TabsContent>
              <TabsContent value="images" className="mt-6">
                <ImagesForm form={form} />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <div className="flex gap-2">
              {activeTab !== "basic" && (
                <Button type="button" variant="ghost" onClick={() => {
                  const tabs = ["basic", "location", "specs", "pricing", "audience", "images"];
                  const idx = tabs.indexOf(activeTab);
                  if (idx > 0) setActiveTab(tabs[idx - 1]);
                }}>
                  Previous
                </Button>
              )}
              {activeTab !== "images" ? (
                <Button type="button" onClick={() => {
                  const tabs = ["basic", "location", "specs", "pricing", "audience", "images"];
                  const idx = tabs.indexOf(activeTab);
                  if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1]);
                }}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Asset"}
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </form>
      </Form>
    </div>
  );
}

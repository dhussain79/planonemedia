"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useSellerAsset, useUpdateSellerAsset } from "@/hooks/use-seller-assets";

export default function EditAssetPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: asset, isLoading } = useSellerAsset(id);
  const updateMutation = useUpdateSellerAsset();
  const [activeTab, setActiveTab] = useState("basic");

  const form = useForm<z.input<typeof createAssetSchema>>({
    resolver: zodResolver(createAssetSchema),
    defaultValues: {
      title: "",
      description: "",
      mediaType: undefined,
      format: "",
      location: { city: "", country: "", address: "", governorate: "" },
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

  useEffect(() => {
    if (asset) {
      form.reset({
        title: asset.title || "",
        description: asset.description || "",
        mediaType: asset.mediaType || undefined,
        format: asset.format || "",
        location: {
          address: asset.locationAddress || "",
          city: asset.locationCity || "",
          country: asset.locationCountry || "",
          governorate: asset.locationGovernorate || "",
          lat: asset.locationLat ?? undefined,
          lng: asset.locationLng ?? undefined,
        },
        width: asset.width,
        height: asset.height,
        displayArea: asset.displayArea,
        resolution: asset.resolution || "",
        orientation: asset.orientation || "",
        isIlluminated: asset.isIlluminated || false,
        hasAudio: asset.hasAudio || false,
        isInteractive: asset.isInteractive || false,
        pricingModel: asset.pricingModel || undefined,
        basePrice: asset.basePrice,
        currency: asset.currency || "SAR",
        minimumSpend: asset.minimumSpend,
        slotGranularity: asset.slotGranularity || "",
        dailyImpressions: asset.dailyImpressions,
        monthlyImpressions: asset.monthlyImpressions,
        estimatedViews: asset.estimatedViews,
        audienceDemographics: asset.audienceDemographics || null,
        images: (asset.images as any) || [],
      });
    }
  }, [asset, form]);

  const onSubmit = (data: z.input<typeof createAssetSchema>) => {
    updateMutation.mutate(
      { id, data },
      {
        onSuccess: () => {
          router.push("/supplier/assets");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <p className="text-muted-foreground">Asset not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Toaster />
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Asset</h1>
        <p className="text-muted-foreground">{asset.title}</p>
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
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
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

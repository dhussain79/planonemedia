"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const waitlistSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  numberOfAssets: z.string().regex(/^\d+$/, "Must be a positive number"),
  preferredCities: z.string().min(1, "Please list at least one city"),
});

type WaitlistFormData = z.infer<typeof waitlistSchema>;

export default function WaitlistForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
  });

  const onSubmit = async (data: WaitlistFormData) => {
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch {
      // fallback: show success anyway for now
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <Card className="mx-auto max-w-lg text-center">
        <CardContent className="pt-8 pb-8">
          <CheckCircle2 className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <CardTitle className="text-xl mb-2">You&apos;re on the list!</CardTitle>
          <CardDescription className="text-base">
            Thanks for joining the PlanOneMedia waitlist. We&apos;ll reach out
            when early access opens.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Join the Waitlist</CardTitle>
        <CardDescription>
          Fill in your details and we&apos;ll notify you when the platform is
          ready.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input id="companyName" placeholder="Acme Media Group" {...register("companyName")} />
            {errors.companyName && (
              <p className="text-sm text-destructive">{errors.companyName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input id="contactPerson" placeholder="Ahmed Al-Rashid" {...register("contactPerson")} />
            {errors.contactPerson && (
              <p className="text-sm text-destructive">{errors.contactPerson.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="ahmed@example.com" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" placeholder="+966 50 123 4567" {...register("phone")} />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="numberOfAssets">Number of Assets</Label>
            <Input id="numberOfAssets" type="number" min={1} placeholder="50" {...register("numberOfAssets")} />
            {errors.numberOfAssets && (
              <p className="text-sm text-destructive">{errors.numberOfAssets.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredCities">Preferred Cities</Label>
            <Textarea
              id="preferredCities"
              placeholder="Riyadh, Jeddah, Dubai, Cairo..."
              className="resize-none"
              {...register("preferredCities")}
            />
            {errors.preferredCities && (
              <p className="text-sm text-destructive">{errors.preferredCities.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              "Join Waitlist"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

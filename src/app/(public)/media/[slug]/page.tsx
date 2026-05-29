import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  Building2,
  Globe,
  Star,
  MapPin,
  Eye,
  Monitor,
  Sun,
  Volume2,
  Cpu,
  Ruler,
  DollarSign,
  Grid3X3,
  Image as ImageIcon,
  Phone,
  Mail,
  ExternalLink,
  ShieldCheck,
  Clock,
  TrendingUp,
  Users,
  Maximize2,
  MoveHorizontal,
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const typeLabels: Record<string, string> = {
  NEWSPAPER: "Newspaper",
  MAGAZINE: "Magazine",
  TV: "TV",
  RADIO: "Radio",
  OUTDOOR: "Outdoor",
  ONLINE: "Online",
  CINEMA: "Cinema",
  OTHER: "Other",
};

function StarRating({ rating }: { rating: number | null }) {
  if (rating == null) return null;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={18}
          className={i < rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}
        />
      ))}
      <span className="ml-1 text-sm text-muted-foreground">{rating}/5</span>
    </div>
  );
}

function SpecItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number | boolean | null | undefined }) {
  if (value == null || value === false) return null;
  const display = typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-white p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{display}</p>
      </div>
    </div>
  );
}

export default async function MediaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const media = await prisma.media.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
    include: {
      supplier: true,
      categories: { include: { category: true } },
      rateCards: { where: { isActive: true }, orderBy: { priority: "desc" } },
    },
  });

  if (!media) notFound();

  const images = (media.images as { url: string; alt?: string; isThumbnail?: boolean; sortOrder?: number }[]) || [];
  const ratecardFiles = (media.ratecardFiles as { fid?: string; url?: string; name?: string }[]) || [];
  const demographics = media.audienceDemographics as Record<string, unknown> | null;

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/media"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Media Directory
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mx-auto max-w-5xl">
          {/* Hero */}
          <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
            {(images.find(i => i.isThumbnail) || images[0]) ? (
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={(images.find(i => i.isThumbnail) || images[0])!.url}
                    alt={media.title}
                    className="h-full w-full object-cover"
                  />
              </div>
            ) : (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Building2 className="h-10 w-10" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{media.title}</h1>
                {media.mediaType && (
                  <span className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-medium text-blue-700">
                    {typeLabels[media.mediaType] || media.mediaType}
                  </span>
                )}
              </div>
              {media.supplier && (
                <p className="mt-1 flex items-center gap-1.5 text-lg text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  {media.supplier.companyName}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <StarRating rating={media.starRating} />
                {media.region && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {media.region}
                    {media.locationCity ? `, ${media.locationCity}` : ""}
                  </span>
                )}
                {media.assetStatus && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {media.assetStatus.replace(/_/g, " ")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
            {media.dailyImpressions != null ? (
              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Daily Impressions</p>
                <p className="mt-1 text-xl font-bold text-blue-600">{media.dailyImpressions.toLocaleString()}</p>
              </div>
            ) : null}
            {media.monthlyImpressions != null ? (
              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Monthly Impressions</p>
                <p className="mt-1 text-xl font-bold text-blue-600">{media.monthlyImpressions.toLocaleString()}</p>
              </div>
            ) : null}
            {media.estimatedViews != null ? (
              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Estimated Views</p>
                <p className="mt-1 text-xl font-bold text-blue-600">{media.estimatedViews.toLocaleString()}</p>
              </div>
            ) : null}
            {media.basePrice != null && (
              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {media.pricingModel || "Base"} Price
                </p>
                <p className="mt-1 text-xl font-bold text-blue-600">
                  {media.currency || "SAR"} {media.basePrice.toLocaleString()}
                </p>
              </div>
            )}
          </div>

          <div className="grid gap-10 lg:grid-cols-3">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-10">
              {/* Description */}
              {media.description && (
                <section>
                  <h2 className="text-lg font-semibold mb-3">About</h2>
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    <p>{media.description}</p>
                  </div>
                  {media.summary && (
                    <p className="mt-3 text-sm text-muted-foreground italic">{media.summary}</p>
                  )}
                </section>
              )}

              {/* Specifications */}
              <section>
                <h2 className="text-lg font-semibold mb-4">Specifications</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <SpecItem icon={Monitor} label="Format" value={media.format} />
                  <SpecItem icon={Grid3X3} label="Resolution" value={media.resolution} />
                  <SpecItem icon={Ruler} label="Dimensions" value={media.width && media.height ? `${media.width} × ${media.height}` : null} />
                  <SpecItem icon={Maximize2} label="Display Area" value={media.displayArea ? `${media.displayArea} m²` : null} />
                  <SpecItem icon={MoveHorizontal} label="Orientation" value={media.orientation} />
                  <SpecItem icon={Sun} label="Illuminated" value={media.isIlluminated} />
                  <SpecItem icon={Volume2} label="Audio" value={media.hasAudio} />
                  <SpecItem icon={Cpu} label="Interactive" value={media.isInteractive} />
                  <SpecItem icon={DollarSign} label="Pricing Model" value={media.pricingModel} />
                  <SpecItem icon={Clock} label="Slot Granularity" value={media.slotGranularity} />
                </div>
              </section>

              {/* Images */}
              {images.length > 1 && (
                <section>
                  <h2 className="text-lg font-semibold mb-4">Gallery</h2>
                  <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                    {images.map((img, i) => (
                      <div key={i} className="group relative aspect-video overflow-hidden rounded-lg border bg-gray-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={img.alt || `${media.title} image ${i + 1}`}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        {img.isThumbnail && (
                          <span className="absolute top-2 left-2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-medium text-white">
                            Thumbnail
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Audience Demographics */}
              {demographics && Object.keys(demographics).length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Audience Demographics
                  </h2>
                  <div className="rounded-xl border bg-white">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="px-4 py-3 text-left font-medium text-muted-foreground">Segment</th>
                          <th className="px-4 py-3 text-left font-medium text-muted-foreground">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(demographics).map(([key, value]) => (
                          <tr key={key} className="border-b last:border-0">
                            <td className="px-4 py-3 capitalize text-muted-foreground">{key.replace(/([A-Z])/g, " $1").trim()}</td>
                            <td className="px-4 py-3 font-medium">{String(value)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Rate Card Files */}
              {ratecardFiles.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-4">Rate Card Files</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {ratecardFiles.map((file, i) => (
                      <a
                        key={file.fid ?? i}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <ImageIcon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{file.name || `Rate Card ${i + 1}`}</p>
                          <p className="text-xs text-muted-foreground">Click to view</p>
                        </div>
                        <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Location */}
              {media.locationAddress && (
                <div className="rounded-xl border bg-white p-5 shadow-sm">
                  <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    Location
                  </h3>
                  <p className="text-sm text-muted-foreground">{media.locationAddress}</p>
                  {media.locationCity && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {[media.locationCity, media.locationGovernorate, media.locationCountry].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              )}

              {/* Pricing */}
              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  Pricing
                </h3>
                <div className="space-y-3">
                  {media.pricingModel && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Model</span>
                      <span className="font-medium">{media.pricingModel}</span>
                    </div>
                  )}
                  {media.basePrice != null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Base Price</span>
                      <span className="font-medium">{media.currency || "SAR"} {media.basePrice.toLocaleString()}</span>
                    </div>
                  )}
                  {media.minimumSpend != null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Minimum Spend</span>
                      <span className="font-medium">{media.currency || "SAR"} {media.minimumSpend.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                {media.rateCards.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Rate cards ({media.rateCards.length})</p>
                    <div className="space-y-2">
                      {media.rateCards.slice(0, 3).map(rc => (
                        <div key={rc.id} className="flex justify-between text-xs">
                          <span className="text-muted-foreground truncate">{rc.name}</span>
                          <span className="font-medium">{rc.currency} {rc.baseRate.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Supplier */}
              {media.supplier && (
                <div className="rounded-xl border bg-white p-5 shadow-sm">
                  <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    Supplier
                  </h3>
                  <p className="text-sm font-medium">{media.supplier.companyName}</p>
                  <div className="mt-3 space-y-2 text-sm">
                    {media.supplier.email && (
                      <a href={`mailto:${media.supplier.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-blue-600 transition-colors">
                        <Mail className="h-3.5 w-3.5" />
                        {media.supplier.email}
                      </a>
                    )}
                    {media.supplier.phone && (
                      <a href={`tel:${media.supplier.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-blue-600 transition-colors">
                        <Phone className="h-3.5 w-3.5" />
                        {media.supplier.phone}
                      </a>
                    )}
                    {media.supplier.website && (
                      <a
                        href={media.supplier.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-muted-foreground hover:text-blue-600 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        {(() => { try { return new URL(media.supplier.website!).hostname } catch { return media.supplier.website } })()}
                      </a>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      media.supplier.status === "ACTIVE"
                        ? "bg-green-50 text-green-700"
                        : media.supplier.status === "PENDING_VERIFICATION"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-gray-50 text-gray-600"
                    }`}>
                      {media.supplier.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              )}

              {/* Categories */}
              {media.categories.length > 0 && (
                <div className="rounded-xl border bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-semibold mb-3">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {media.categories.map(mc => (
                      <span
                        key={mc.categoryId}
                        className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                      >
                        {mc.category.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="rounded-xl border bg-gradient-to-br from-blue-600 to-blue-700 p-5 shadow-sm text-white">
                <h3 className="text-base font-semibold">Interested in this media?</h3>
                <p className="mt-1 text-sm text-blue-100">
                  Contact the supplier or request a booking.
                </p>
                <Link
                  href={`/signin?callbackUrl=/media/${media.slug ?? media.id}`}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
                >
                  Request Booking
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

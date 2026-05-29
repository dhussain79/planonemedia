import Link from "next/link";
import { prisma } from "@/lib/prisma";
import MediaMap from "@/components/media-map";
import {
  ArrowRight,
  Newspaper,
  Monitor,
  Radio,
  Tv,
  Film,
  Globe,
  Building2,
  MapIcon,
  Search,
  Star,
  MapPin,
  Eye,
} from "lucide-react";

const typeIcons: Record<string, typeof Newspaper> = {
  NEWSPAPER: Newspaper,
  MAGAZINE: Newspaper,
  TV: Tv,
  RADIO: Radio,
  OUTDOOR: Building2,
  ONLINE: Monitor,
  CINEMA: Film,
};

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

function MediaIcon({ type }: { type: string | null }) {
  const Icon = type ? typeIcons[type] : Globe;
  return <Icon className="h-5 w-5" />;
}

function StarRating({ rating }: { rating: number | null }) {
  if (rating == null) return null;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

interface PageProps {
  searchParams: Promise<{ type?: string; region?: string; q?: string; page?: string }>;
}

const PAGE_SIZE = 12;

export default async function MediaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const where: Record<string, unknown> = {
    assetStatus: "ACTIVE",
  };

  if (params.type) where.mediaType = params.type;
  if (params.region) where.region = params.region;
  if (params.q) where.title = { contains: params.q, mode: "insensitive" };

  const [media, totalCount, types, regions] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: { title: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { supplier: { select: { companyName: true } } },
    }),
    prisma.media.count({ where }),
    prisma.media.findMany({ select: { mediaType: true }, distinct: ["mediaType"] }),
    prisma.media.findMany({ select: { region: true }, distinct: ["region"] }),
  ]);

  const uniqueTypes = [...new Set(types.map(t => t.mediaType).filter(Boolean))] as string[];
  const uniqueRegions = [...new Set(regions.map(r => r.region).filter(Boolean))] as string[];
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const mapPins = media
    .filter(m => m.locationLat != null && m.locationLng != null)
    .map(m => ({
      id: m.id,
      title: m.title,
      slug: m.slug,
      lat: m.locationLat!,
      lng: m.locationLng!,
      mediaType: m.mediaType,
      region: m.region,
    }));

  function buildHref(updates: { type?: string; region?: string; q?: string; page?: string }): string {
    const sp = new URLSearchParams();
    const nextType = "type" in updates ? updates.type : params.type;
    const nextRegion = "region" in updates ? updates.region : params.region;
    const nextQ = "q" in updates ? updates.q : params.q;
    const nextPage = "page" in updates ? updates.page : (params.page || undefined);
    if (nextType) sp.set("type", nextType);
    if (nextRegion) sp.set("region", nextRegion);
    if (nextQ) sp.set("q", nextQ);
    if (nextPage) sp.set("page", nextPage);
    const qs = sp.toString();
    return `/media${qs ? `?${qs}` : ""}`;
  }

  return (
    <>
      <div className="border-b bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-4xl font-bold tracking-tight">Media Directory</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Browse {totalCount.toLocaleString()} media assets across the MENA region
          </p>
          <form
            action="/media"
            method="GET"
            className="mt-6 flex max-w-xl gap-3"
          >
            {(params.type || params.region) && (
              <input type="hidden" name="type" value={params.type} />
            )}
            {params.region && !params.type && (
              <input type="hidden" name="region" value={params.region} />
            )}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                name="q"
                defaultValue={params.q || ""}
                placeholder="Search media by title..."
                className="h-10 w-full rounded-lg border bg-white pl-9 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href={buildHref({ type: undefined })}
            className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              !params.type && !params.region
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </Link>
          {uniqueTypes.map(type => (
            <Link
              key={type}
              href={buildHref({ type: params.type === type ? undefined : type })}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                params.type === type
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <MediaIcon type={type} />
              {typeLabels[type] || type.charAt(0) + type.slice(1).toLowerCase()}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {uniqueRegions.map(region => (
            <Link
              key={region}
              href={buildHref({ region: params.region === region ? undefined : region })}
              className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                params.region === region
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {region}
            </Link>
          ))}
        </div>

        {media.length > 0 && mapPins.length > 1 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <MapIcon className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-muted-foreground">Map View</h2>
            </div>
            <MediaMap className="h-[400px] w-full border" pins={mapPins} />
          </div>
        )}

        {media.length === 0 ? (
          <div className="text-center py-20">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-lg text-muted-foreground">No media found matching your filters.</p>
            <Link href="/media" className="mt-3 inline-block text-sm text-blue-600 underline underline-offset-2">
              Clear all filters
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {media.map(m => (
                <Link
                  key={m.id}
                  href={`/media/${m.slug ?? m.id}`}
                  className="group rounded-xl border bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                        <MediaIcon type={m.mediaType} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold group-hover:text-blue-600 transition-colors leading-snug">
                          {m.title}
                        </h3>
                        {m.supplier && (
                          <p className="mt-0.5 text-xs text-muted-foreground truncate">
                            {m.supplier.companyName}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      {m.mediaType && (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                          {typeLabels[m.mediaType] || m.mediaType}
                        </span>
                      )}
                      <StarRating rating={m.starRating} />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {m.region && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {m.region}
                        </span>
                      )}
                      {m.basePrice != null && (
                        <span className="font-medium text-gray-700">
                          From {m.currency || "SAR"} {m.basePrice.toLocaleString()}
                        </span>
                      )}
                      {m.dailyImpressions != null ? (
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {m.dailyImpressions.toLocaleString()}/day
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={buildHref({ page: String(page - 1) })}
                    className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-1 text-muted-foreground">...</span>
                      )}
                      <Link
                        href={buildHref({ page: String(p) })}
                        className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          p === page
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {p}
                      </Link>
                    </span>
                  ))}
                {page < totalPages && (
                  <Link
                    href={buildHref({ page: String(page + 1) })}
                    className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import MediaMap from "@/components/media-map";
import { ArrowRight, Newspaper, Monitor, Radio, Tv, Film, Globe, Building2, MapIcon } from "lucide-react";

const typeIcons: Record<string, typeof Newspaper> = {
  NEWSPAPER: Newspaper,
  MAGAZINE: Newspaper,
  TV: Tv,
  RADIO: Radio,
  OUTDOOR: Building2,
  ONLINE: Monitor,
  CINEMA: Film,
};

function MediaIcon({ type }: { type: string | null }) {
  const Icon = type ? typeIcons[type] : Globe;
  return <Icon className="h-5 w-5" />;
}

interface PageProps {
  searchParams: Promise<{ type?: string; region?: string; q?: string }>;
}

export default async function MediaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const where: Record<string, unknown> = {};

  if (params.type) where.mediaType = params.type;
  if (params.region) where.region = params.region;
  if (params.q) where.title = { contains: params.q, mode: "insensitive" };

  const [media, types, regions] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: { title: "asc" },
      include: { supplier: { select: { companyName: true } } },
    }),
    prisma.media.findMany({ select: { mediaType: true }, distinct: ["mediaType"] }),
    prisma.media.findMany({ select: { region: true }, distinct: ["region"] }),
  ]);

  const uniqueTypes = [...new Set(types.map(t => t.mediaType).filter(Boolean))] as string[];
  const uniqueRegions = [...new Set(regions.map(r => r.region).filter(Boolean))] as string[];

  return (
    <>
        <div className="border-b bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold tracking-tight">Media Directory</h1>
            <p className="mt-2 text-muted-foreground">
              Browse {media.length.toLocaleString()} media assets across the MENA region
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap gap-3 mb-8">
            <Link
              href="/media"
              className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${!params.type && !params.region ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              All
            </Link>
            {uniqueTypes.map(type => (
              <Link
                key={type}
                href={`/media?type=${type}${params.region ? `&region=${params.region}` : ""}`}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${params.type === type ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                <MediaIcon type={type} />
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mb-10">
            {uniqueRegions.map(region => (
              <Link
                key={region}
                href={`/media?region=${encodeURIComponent(region)}${params.type ? `&type=${params.type}` : ""}`}
                className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${params.region === region ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {region}
              </Link>
            ))}
          </div>

          {media.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-3">
                <MapIcon className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-muted-foreground">Map View</h2>
              </div>
              <MediaMap
                className="h-[400px] w-full border"
                pins={[]}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Map pins will appear once media locations are geocoded.
              </p>
            </div>
          )}

          {media.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No media found matching your filters.</p>
              <Link href="/media" className="text-blue-600 underline underline-offset-2 mt-2 inline-block">
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {media.map(m => (
                <Link
                  key={m.id}
                  href={`/media/${m.slug ?? m.id}`}
                  className="group rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                      <MediaIcon type={m.mediaType} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm leading-snug group-hover:text-blue-600 transition-colors">
                        {m.title}
                      </h3>
                      {m.supplier && (
                        <p className="mt-1 text-xs text-muted-foreground truncate">
                          {m.supplier.companyName}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {m.mediaType && (
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                            {m.mediaType}
                          </span>
                        )}
                        {m.region && (
                          <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600">
                            {m.region}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
    </>
  );
}

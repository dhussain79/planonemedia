import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Building2, Globe, Star } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function MediaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const media = await prisma.media.findFirst({
    where: { slug },
    include: {
      supplier: true,
      categories: { include: { category: true } },
    },
  });

  if (!media) notFound();

  return (
    <>
      <div className="border-b bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
          <div className="mx-auto max-w-4xl">
            <div className="flex items-start gap-4 mb-8">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Building2 className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{media.title}</h1>
                {media.supplier && (
                  <p className="mt-2 text-lg text-muted-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {media.supplier.companyName}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-3 mb-10">
              {media.mediaType && (
                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Type</p>
                  <p className="mt-1 text-sm font-semibold">{media.mediaType}</p>
                </div>
              )}
              {media.region && (
                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Region</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-sm font-semibold">{media.region}</p>
                  </div>
                </div>
              )}
              {media.starRating != null && (
                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Rating</p>
                  <div className="mt-1 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <p className="text-sm font-semibold">{media.starRating}/5</p>
                  </div>
                </div>
              )}
            </div>

            {media.description && (
              <div className="mb-10">
                <h2 className="text-lg font-semibold mb-3">About</h2>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  <p>{media.description}</p>
                </div>
              </div>
            )}

            {media.summary && (
              <div className="mb-10">
                <h2 className="text-lg font-semibold mb-3">Summary</h2>
                <p className="text-sm text-muted-foreground">{media.summary}</p>
              </div>
            )}

            {media.categories.length > 0 && (
              <div className="mb-10">
                <h2 className="text-lg font-semibold mb-3">Categories</h2>
                <div className="flex flex-wrap gap-2">
                  {media.categories.map(mc => (
                    <span
                      key={mc.categoryId}
                      className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                    >
                      {mc.category.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {media.supplier && (
              <div className="rounded-xl border bg-gray-50 p-6">
                <h2 className="text-lg font-semibold mb-4">Supplier Information</h2>
                <div className="grid gap-4 sm:grid-cols-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Company</p>
                    <p className="font-medium">{media.supplier.companyName}</p>
                  </div>
                  {media.supplier.email && (
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{media.supplier.email}</p>
                    </div>
                  )}
                  {media.supplier.phone && (
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{media.supplier.phone}</p>
                    </div>
                  )}
                  {media.supplier.website && (
                    <div>
                      <p className="text-muted-foreground">Website</p>
                      <p className="font-medium">{media.supplier.website}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(() => {
              const files = media.ratecardFiles as { fid?: string; url?: string }[] | null;
              if (!files || files.length === 0) return null;
              return (
                <div className="mt-10">
                  <h2 className="text-lg font-semibold mb-3">Rate Card Files</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {files.map((file, i) => (
                      <div key={file.fid ?? i} className="rounded-lg border bg-white p-4 shadow-sm">
                        {file.url ? (
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-blue-600 hover:underline"
                          >
                            View Rate Card {file.url.split("/").pop()}
                          </a>
                        ) : (
                          <p className="text-sm text-muted-foreground">Rate card file #{i + 1}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
    </>
  );
}

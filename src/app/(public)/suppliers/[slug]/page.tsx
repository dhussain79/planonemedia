import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Building2, Globe, Mail, Phone, MapPin } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SupplierPublicPage({ params }: PageProps) {
  const { slug } = await params;

  const supplier = await prisma.supplier.findFirst({
    where: {
      companyName: { contains: slug.replace(/-/g, " "), mode: "insensitive" },
    },
    include: {
      media: {
        orderBy: { title: "asc" },
        select: { id: true, title: true, slug: true, mediaType: true, region: true, starRating: true },
      },
      contacts: {
        select: { firstName: true, lastName: true, email: true, phone: true, jobTitle: true },
      },
    },
  });

  if (!supplier) notFound();

  return (
    <>
      <main className="flex-1">
        <div className="border-b bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link
              href="/suppliers"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Suppliers
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
                <h1 className="text-3xl font-bold tracking-tight">{supplier.companyName}</h1>
                {supplier.tradingName && (
                  <p className="mt-1 text-muted-foreground">{supplier.tradingName}</p>
                )}
                <div className="mt-2 flex items-center gap-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    supplier.status === "ACTIVE"
                      ? "bg-green-50 text-green-700"
                      : supplier.status === "PENDING_VERIFICATION"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-gray-50 text-gray-600"
                  }`}>
                    {supplier.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            </div>

            {supplier.description && (
              <div className="mb-10">
                <h2 className="text-lg font-semibold mb-3">About</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{supplier.description}</p>
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2 mb-10">
              {supplier.email && (
                <div className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{supplier.email}</p>
                  </div>
                </div>
              )}
              {supplier.phone && (
                <div className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{supplier.phone}</p>
                  </div>
                </div>
              )}
              {supplier.website && (
                <div className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Website</p>
                    <p className="text-sm font-medium">{supplier.website}</p>
                  </div>
                </div>
              )}
              {supplier.billingAddress && (
                <div className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="text-sm font-medium">{supplier.billingAddress}</p>
                  </div>
                </div>
              )}
            </div>

            {supplier.contacts.length > 0 && (
              <div className="mb-10">
                <h2 className="text-lg font-semibold mb-3">Contacts</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {supplier.contacts.map((c, i) => (
                    <div key={i} className="rounded-xl border bg-white p-4 shadow-sm">
                      <p className="font-medium text-sm">{c.firstName} {c.lastName}</p>
                      {c.jobTitle && <p className="text-xs text-muted-foreground">{c.jobTitle}</p>}
                      {c.email && <p className="text-xs text-muted-foreground mt-1">{c.email}</p>}
                      {c.phone && <p className="text-xs text-muted-foreground">{c.phone}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {supplier.media.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Media Listings ({supplier.media.length})</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {supplier.media.map((m) => (
                    <Link
                      key={m.id}
                      href={`/media/${m.slug ?? m.id}`}
                      className="group rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md"
                    >
                      <h3 className="font-medium text-sm group-hover:text-blue-600 transition-colors">
                        {m.title}
                      </h3>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
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
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

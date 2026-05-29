import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Building2, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { companyName: "asc" },
    include: {
      _count: { select: { media: true } },
    },
  });

  return (
    <>
      <div className="border-b bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
            <p className="mt-2 text-muted-foreground">
              {suppliers.length.toLocaleString()} media suppliers across the MENA region
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {suppliers.map((s) => (
              <Link
                key={s.id}
                href={`/suppliers/${encodeURIComponent(s.companyName.toLowerCase().replace(/\s+/g, "-"))}`}
                className="group rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                      {s.companyName}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {s._count.media} media listing{s._count.media !== 1 ? "s" : ""}
                    </p>
                    <span className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      s.status === "ACTIVE"
                        ? "bg-green-50 text-green-700"
                        : s.status === "PENDING_VERIFICATION"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-gray-50 text-gray-600"
                    }`}>
                      {s.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        </div>
    </>
  );
}

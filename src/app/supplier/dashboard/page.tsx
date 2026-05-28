import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/site-header";
import { Building2, LogOut, Package } from "lucide-react";

async function updateProfile(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const claim = await prisma.sellerVerification.findFirst({
    where: { userId: session.user.id, status: "APPROVED" },
  });
  if (!claim) throw new Error("No approved claim");

  const data: Record<string, string | null> = {};
  for (const field of ["tradingName", "email", "phone", "website", "billingAddress"]) {
    data[field] = formData.get(field) as string || null;
  }

  await prisma.supplier.update({
    where: { id: claim.supplierId },
    data,
  });
}

export const dynamic = "force-dynamic";

export default async function SupplierDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { claims: { include: { supplier: { include: { media: { orderBy: { title: "asc" } } } } } } },
  });

  const approvedClaim = user?.claims.find(c => c.status === "APPROVED");
  const pendingClaim = user?.claims.find(c => c.status === "PENDING");
  const supplier = approvedClaim?.supplier;

  return (
    <>
      <SiteHeader variant="internal" />
      <main className="container mx-auto max-w-4xl px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Supplier Dashboard</h1>
            <p className="mt-1 text-muted-foreground">Signed in as {session.user.email}</p>
          </div>
          <form action={async () => {
            "use server";
            const { signOut } = await import("@/lib/auth");
            await signOut();
          }}>
            <Button type="submit" variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </div>

        {!approvedClaim && !pendingClaim && (
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
              <CardTitle className="text-xl mb-2">No Company Claimed Yet</CardTitle>
              <CardDescription className="mb-6">
                Search for your company to claim your supplier profile
              </CardDescription>
              <a href="/supplier/claim">
                <Button>Claim Your Company</Button>
              </a>
            </CardContent>
          </Card>
        )}

        {pendingClaim && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-6">
            <p className="text-sm text-amber-800">
              <strong>Claim Pending</strong> — Your claim for{" "}
              {pendingClaim.supplier.companyName} is under review. We&apos;ll
              notify you once approved.
            </p>
          </div>
        )}

        {supplier && (
          <>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Company Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-[160px_1fr] gap-x-4 gap-y-3 text-sm">
                  <span className="font-medium text-muted-foreground">Company Name</span>
                  <span className="font-semibold">{supplier.companyName}</span>

                  <span className="font-medium text-muted-foreground">Status</span>
                  <span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      supplier.status === "ACTIVE" ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {supplier.status}
                    </span>
                  </span>

                  <span className="font-medium text-muted-foreground">Trading Name</span>
                  <span>{supplier.tradingName ?? "—"}</span>

                  <span className="font-medium text-muted-foreground">Email</span>
                  <span>{supplier.email ?? "—"}</span>

                  <span className="font-medium text-muted-foreground">Phone</span>
                  <span>{supplier.phone ?? "—"}</span>

                  <span className="font-medium text-muted-foreground">Website</span>
                  <span>{supplier.website ? (
                    <a href={`https://${supplier.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline underline-offset-2">
                      {supplier.website}
                    </a>
                  ) : "—"}</span>

                  <span className="font-medium text-muted-foreground">Billing Address</span>
                  <span>{supplier.billingAddress ?? "—"}</span>

                  <span className="font-medium text-muted-foreground">VAT Number</span>
                  <span>{supplier.vatNumber ?? "—"}</span>

                  <span className="font-medium text-muted-foreground">CRN</span>
                  <span>{supplier.crn ?? "—"}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Edit Profile
                </CardTitle>
                <CardDescription>Update your company details</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={updateProfile} className="space-y-4 max-w-md">
                  {([
                    ["tradingName", "Trading Name"],
                    ["email", "Email"],
                    ["phone", "Phone"],
                    ["website", "Website"],
                    ["billingAddress", "Billing Address"],
                  ] as const).map(([field, label]) => (
                    <div key={field} className="space-y-2">
                      <Label htmlFor={field}>{label}</Label>
                      <Input
                        id={field}
                        name={field}
                        defaultValue={(supplier as any)[field] ?? ""}
                      />
                    </div>
                  ))}
                  <Button type="submit">Save Changes</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Media Listings ({supplier.media.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {supplier.media.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No media listings yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-3 pr-4 font-medium text-muted-foreground">Title</th>
                          <th className="pb-3 pr-4 font-medium text-muted-foreground">Type</th>
                          <th className="pb-3 pr-4 font-medium text-muted-foreground">Region</th>
                          <th className="pb-3 pr-4 font-medium text-muted-foreground">Rating</th>
                          <th className="pb-3 font-medium text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {supplier.media.map(m => (
                          <tr key={m.id} className="border-b last:border-0">
                            <td className="py-3 pr-4 font-medium">{m.title}</td>
                            <td className="py-3 pr-4 text-muted-foreground">{m.mediaType}</td>
                            <td className="py-3 pr-4 text-muted-foreground">{m.region ?? "—"}</td>
                            <td className="py-3 pr-4 text-muted-foreground">{m.starRating != null ? `${m.starRating}/100` : "—"}</td>
                            <td className="py-3">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                m.status === "published" ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}>
                                {m.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </>
  );
}

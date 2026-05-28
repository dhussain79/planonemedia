import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/site-header";
import { CheckCircle2, XCircle } from "lucide-react";

async function getClaims() {
  return prisma.sellerVerification.findMany({
    include: {
      user: { select: { email: true, name: true } },
      supplier: { select: { companyName: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function approveClaim(formData: FormData) {
  "use server";
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

  const id = formData.get("id") as string;
  await prisma.sellerVerification.update({
    where: { id },
    data: { status: "APPROVED", decidedBy: session.user.id, decidedAt: new Date() },
  });
  const claim = await prisma.sellerVerification.findUnique({
    where: { id },
    include: { supplier: true },
  });
  if (claim) {
    await prisma.supplier.update({
      where: { id: claim.supplierId },
      data: { status: "ACTIVE" },
    });
  }
}

async function rejectClaim(formData: FormData) {
  "use server";
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

  const id = formData.get("id") as string;
  await prisma.sellerVerification.update({
    where: { id },
    data: { status: "REJECTED", decidedBy: session.user.id, decidedAt: new Date() },
  });
}

export const dynamic = "force-dynamic";

export default async function AdminClaimsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const claims = await getClaims();

  return (
    <>
      <SiteHeader variant="internal" />
      <main className="container mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Claim Requests</h1>
          <p className="mt-2 text-muted-foreground">
            Review and manage supplier claim requests
          </p>
        </div>

        {claims.length === 0 ? (
          <Card>
            <CardContent className="pt-6 pb-6 text-center">
              <p className="text-muted-foreground">No pending claims.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {claims.map((c) => (
              <Card key={c.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{c.supplier.companyName}</CardTitle>
                      <CardDescription>
                        Claimed by {c.user.name ?? c.user.email} on{" "}
                        {c.createdAt.toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      c.status === "PENDING" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                      c.status === "APPROVED" ? "bg-green-50 text-green-700 border border-green-200" :
                      "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      {c.status}
                    </span>
                  </div>
                </CardHeader>
                {c.status === "PENDING" && (
                  <CardContent>
                    <div className="flex gap-3">
                      <form action={approveClaim}>
                        <input type="hidden" name="id" value={c.id} />
                        <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          Approve
                        </Button>
                      </form>
                      <form action={rejectClaim}>
                        <input type="hidden" name="id" value={c.id} />
                        <Button type="submit" size="sm" variant="destructive">
                          <XCircle className="mr-1 h-4 w-4" />
                          Reject
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

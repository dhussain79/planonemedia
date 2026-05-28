import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import ClaimNotification from "@/emails/claim-notification";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  if (!q || q.length < 2) {
    return NextResponse.json({ suppliers: [] });
  }

  const suppliers = await prisma.supplier.findMany({
    where: {
      companyName: { contains: q, mode: "insensitive" },
    },
    select: { id: true, companyName: true, status: true },
    orderBy: { companyName: "asc" },
    take: 20,
  });

  return NextResponse.json({ suppliers });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { supplierId } = await req.json();
    if (!supplierId) {
      return NextResponse.json({ error: "Supplier ID is required" }, { status: 400 });
    }

    const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }

    const existing = await prisma.sellerVerification.findUnique({
      where: { userId_supplierId: { userId: session.user.id, supplierId } },
    });
    if (existing) {
      return NextResponse.json({ error: "Already claimed or pending" }, { status: 409 });
    }

    const claim = await prisma.sellerVerification.create({
      data: {
        userId: session.user.id,
        supplierId,
      },
    });

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { email: true },
    });

    for (const admin of admins) {
      await sendEmail({
        to: admin.email,
        subject: `New claim: ${supplier.companyName}`,
        react: ClaimNotification({
          companyName: supplier.companyName,
          userName: session.user.name ?? session.user.email ?? "Unknown",
          userEmail: session.user.email ?? "",
          claimUrl: `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/admin/claims`,
        }),
      });
    }

    return NextResponse.json({ claim }, { status: 201 });
  } catch (error) {
    console.error("Claim error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { indexMediaDocument, removeMediaDocument } from "@/lib/search/client";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const media = await prisma.media.findUnique({
    where: { id },
  });

  if (!media) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  if (media.deletedAt) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { claims: { where: { status: "APPROVED" }, select: { supplierId: true } } },
  });

  const supplierIds = user?.claims.map((c) => c.supplierId) || [];
  if (!supplierIds.includes(media.supplierId || "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ data: media });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.media.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { claims: { where: { status: "APPROVED" }, select: { supplierId: true } } },
  });

  const supplierIds = user?.claims.map((c) => c.supplierId) || [];
  if (!supplierIds.includes(existing.supplierId || "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const {
    title, description, mediaType, format,
    location, width, height, displayArea, resolution, orientation,
    isIlluminated, hasAudio, isInteractive,
    pricingModel, basePrice, currency, minimumSpend, slotGranularity,
    dailyImpressions, monthlyImpressions, estimatedViews, audienceDemographics,
    images, assetStatus,
  } = body;

  const media = await prisma.media.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(mediaType !== undefined && { mediaType }),
      ...(format !== undefined && { format }),
      ...(location !== undefined && {
        locationAddress: location?.address || null,
        locationCity: location?.city || null,
        locationCountry: location?.country || null,
        locationGovernorate: location?.governorate || null,
        locationLat: location?.lat || null,
        locationLng: location?.lng || null,
      }),
      ...(width !== undefined && { width }),
      ...(height !== undefined && { height }),
      ...(displayArea !== undefined && { displayArea }),
      ...(resolution !== undefined && { resolution }),
      ...(orientation !== undefined && { orientation }),
      ...(isIlluminated !== undefined && { isIlluminated }),
      ...(hasAudio !== undefined && { hasAudio }),
      ...(isInteractive !== undefined && { isInteractive }),
      ...(pricingModel !== undefined && { pricingModel }),
      ...(basePrice !== undefined && { basePrice }),
      ...(currency !== undefined && { currency }),
      ...(minimumSpend !== undefined && { minimumSpend }),
      ...(slotGranularity !== undefined && { slotGranularity }),
      ...(dailyImpressions !== undefined && { dailyImpressions }),
      ...(monthlyImpressions !== undefined && { monthlyImpressions }),
      ...(estimatedViews !== undefined && { estimatedViews }),
      ...(audienceDemographics !== undefined && { audienceDemographics }),
      ...(images !== undefined && { images }),
      ...(assetStatus !== undefined && { assetStatus }),
    },
  });

  indexMediaDocument({
    id: media.id,
    title: media.title,
    slug: media.slug,
    mediaType: media.mediaType,
    region: media.region,
    description: media.description,
    summary: media.summary,
    starRating: media.starRating,
    supplierName: user?.claims[0]?.supplierId || null,
    categoryNames: [],
    status: media.assetStatus,
  }).catch(() => {});

  return NextResponse.json({ data: media });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.media.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { claims: { where: { status: "APPROVED" }, select: { supplierId: true } } },
  });

  const supplierIds = user?.claims.map((c) => c.supplierId) || [];
  if (!supplierIds.includes(existing.supplierId || "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.media.update({
    where: { id },
    data: { deletedAt: new Date(), assetStatus: "ARCHIVED" },
  });

  removeMediaDocument(id).catch(() => {});

  return NextResponse.json({ success: true });
}

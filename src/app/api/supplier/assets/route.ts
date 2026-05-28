import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { indexMediaDocument } from "@/lib/search/client";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type") || "";
  const status = searchParams.get("status") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { claims: { where: { status: "APPROVED" } } },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const supplierIds = user.claims.map((c) => c.supplierId);

  const where: any = {
    supplierId: { in: supplierIds },
    deletedAt: null,
  };

  if (q) {
    where.title = { contains: q, mode: "insensitive" };
  }
  if (type) {
    where.mediaType = type;
  }
  if (status) {
    where.assetStatus = status;
  }

  const [data, total] = await Promise.all([
    prisma.media.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        mediaType: true,
        description: true,
        format: true,
        locationCity: true,
        locationCountry: true,
        locationGovernorate: true,
        assetStatus: true,
        basePrice: true,
        currency: true,
        dailyImpressions: true,
        images: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.media.count({ where }),
  ]);

  return NextResponse.json({
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title, description, mediaType, format,
      location, width, height, displayArea, resolution, orientation,
      isIlluminated, hasAudio, isInteractive,
      pricingModel, basePrice, currency, minimumSpend, slotGranularity,
      dailyImpressions, monthlyImpressions, estimatedViews, audienceDemographics,
      images,
    } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { claims: { where: { status: "APPROVED" }, select: { supplierId: true } } },
    });

    const supplierId = user?.claims[0]?.supplierId;
    if (!supplierId) {
      return NextResponse.json({ error: "No verified supplier found" }, { status: 403 });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    const existing = await prisma.media.findFirst({ where: { slug } });
    const uniqueSlug = existing ? `${slug}-${Date.now()}` : slug;

    const media = await prisma.media.create({
      data: {
        title,
        slug: uniqueSlug,
        description: description || null,
        mediaType: mediaType || null,
        format: format || null,
        locationAddress: location?.address || null,
        locationCity: location?.city || null,
        locationCountry: location?.country || null,
        locationGovernorate: location?.governorate || null,
        locationLat: location?.lat || null,
        locationLng: location?.lng || null,
        width: width || null,
        height: height || null,
        displayArea: displayArea || null,
        resolution: resolution || null,
        orientation: orientation || null,
        isIlluminated: isIlluminated || false,
        hasAudio: hasAudio || false,
        isInteractive: isInteractive || false,
        pricingModel: pricingModel || null,
        basePrice: basePrice || null,
        currency: currency || "SAR",
        minimumSpend: minimumSpend || null,
        slotGranularity: slotGranularity || null,
        dailyImpressions: dailyImpressions || null,
        monthlyImpressions: monthlyImpressions || null,
        estimatedViews: estimatedViews || null,
        audienceDemographics: audienceDemographics || null,
        images: images || [],
        assetStatus: "DRAFT",
        supplierId,
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

    return NextResponse.json({ data: media }, { status: 201 });
  } catch (error) {
    console.error("Create asset error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

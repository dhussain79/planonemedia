import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bodySchema = z.object({
  companyName: z.string().min(1),
  contactPerson: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  numberOfAssets: z.string().regex(/^\d+$/),
  preferredCities: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bodySchema.parse(body);

    await prisma.waitlistEntry.create({
      data: {
        companyName: parsed.companyName,
        contactPerson: parsed.contactPerson,
        email: parsed.email,
        phone: parsed.phone,
        numberOfAssets: parseInt(parsed.numberOfAssets, 10),
        preferredCities: parsed.preferredCities,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid submission" },
      { status: 400 },
    );
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop() || "jpg";
    const key = `uploads/${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    if (process.env.R2_ACCESS_KEY_ID) {
      // @ts-ignore - dynamic import for optional R2 dependency
      const mod = await import("@aws-sdk/client-s3");
      const s3 = new mod.S3Client({
        region: "auto",
        endpoint: process.env.R2_ENDPOINT,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID!,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
        },
      });
      await s3.send(
        new mod.PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: file.type,
        }),
      );
      const url = `${process.env.R2_PUBLIC_URL}/${key}`;
      return NextResponse.json({ url, key, size: file.size });
    }

    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;
    return NextResponse.json({ url: dataUrl, key, size: file.size });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

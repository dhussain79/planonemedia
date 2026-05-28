export interface StorageUploadResult {
  key: string;
  url: string;
  size: number;
}

export async function uploadToR2(
  _file: File,
  _key: string
): Promise<StorageUploadResult> {
  // TODO: Implement Cloudflare R2 upload using S3-compatible SDK
  throw new Error("R2 storage not configured. Set R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_ENDPOINT.");
}

export function getPublicUrl(key: string): string {
  const base = process.env.R2_PUBLIC_URL;
  if (!base) throw new Error("R2_PUBLIC_URL not configured");
  return `${base}/${key}`;
}

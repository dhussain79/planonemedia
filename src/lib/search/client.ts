import { Meilisearch } from "meilisearch";

const host = process.env.MEILISEARCH_HOST;
const apiKey = process.env.MEILISEARCH_API_KEY;

let client: Meilisearch | null = null;

export function getMeilisearch(): Meilisearch | null {
  if (!host) return null;
  if (!client) {
    client = new Meilisearch({ host, apiKey: apiKey || undefined });
  }
  return client;
}

export interface MediaSearchDocument {
  id: string;
  title: string;
  slug: string | null;
  mediaType: string | null;
  region: string | null;
  description: string | null;
  summary: string | null;
  starRating: number | null;
  supplierName: string | null;
  categoryNames: string[];
  status: string;
}

export const MEDIA_INDEX = "media";

export async function indexMediaDocument(doc: MediaSearchDocument): Promise<void> {
  const ms = getMeilisearch();
  if (!ms) return;
  try {
    await ms.index(MEDIA_INDEX).updateDocuments([doc]);
  } catch (err) {
    console.error("Meilisearch indexing error:", err);
  }
}

export async function removeMediaDocument(id: string): Promise<void> {
  const ms = getMeilisearch();
  if (!ms) return;
  try {
    await ms.index(MEDIA_INDEX).deleteDocument(id);
  } catch (err) {
    console.error("Meilisearch delete error:", err);
  }
}

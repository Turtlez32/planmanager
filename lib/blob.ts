import { put, del, get } from "@vercel/blob";

export async function uploadPlanHtml(slug: string, html: string): Promise<string> {
  const { url } = await put(`plans/${slug}.html`, html, {
    access: "private",
    contentType: "text/html; charset=utf-8",
    addRandomSuffix: false,
  });
  return url;
}

export async function downloadPlanHtml(blobUrl: string): Promise<string> {
  const result = await get(blobUrl, { access: "private" });
  if (!result || result.statusCode !== 200 || !result.stream) {
    throw new Error(`Blob not found: ${blobUrl}`);
  }
  const chunks: Uint8Array[] = [];
  for await (const chunk of result.stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf-8");
}

export async function deletePlanBlob(blobUrl: string): Promise<void> {
  await del(blobUrl);
}

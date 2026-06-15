import { put, del } from "@vercel/blob";

export async function uploadPlanHtml(slug: string, html: string): Promise<string> {
  const { url } = await put(`plans/${slug}.html`, html, {
    access: "public",
    contentType: "text/html; charset=utf-8",
    addRandomSuffix: false,
  });
  return url;
}

export async function deletePlanBlob(blobUrl: string): Promise<void> {
  await del(blobUrl);
}

import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

export async function GET() {
  const filePath = path.join(process.cwd(), "public", "manifest.webmanifest");

  try {
    const text = await readFile(filePath, "utf8");
    return new Response(text, {
      headers: {
        "content-type": "application/manifest+json; charset=utf-8",
        "cache-control": "public, max-age=0, must-revalidate",
      },
    });
  } catch {
    return new Response("manifest.webmanifest not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}
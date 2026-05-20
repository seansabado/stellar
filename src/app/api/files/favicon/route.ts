import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

export async function GET() {
  const filePath = path.join(process.cwd(), "public", "favicon.ico");

  try {
    const buffer = await readFile(filePath);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "content-type": "image/x-icon",
        "cache-control": "public, max-age=0, must-revalidate",
      },
    });
  } catch {
    return new Response("favicon.ico not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}
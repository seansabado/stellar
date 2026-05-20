import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

export async function GET() {
  const swPath = path.join(process.cwd(), "public", "sw.js");

  try {
    const script = await readFile(swPath, "utf8");
    return new Response(script, {
      headers: {
        "content-type": "application/javascript; charset=utf-8",
        "cache-control": "public, max-age=0, must-revalidate",
      },
    });
  } catch {
    return new Response("Service worker not found", { status: 404 });
  }
}
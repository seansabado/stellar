import { NextResponse } from "next/server";
import { reseedDemoTenantOrders } from "../../../../lib/demoOrderService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await reseedDemoTenantOrders();
    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to reseed demo tenant orders" },
      { status: 500 },
    );
  }
}
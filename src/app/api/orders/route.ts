import { NextResponse } from "next/server";
import { listOrdersByTenant, reseedDemoTenantOrders } from "../../../lib/demoOrderService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_TENANT_ID = "demo-tenant-ph";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId") || DEFAULT_TENANT_ID;
  const status = searchParams.get("status");
  const shouldSync = searchParams.get("sync") === "1";

  let syncResult: Awaited<ReturnType<typeof reseedDemoTenantOrders>> | null = null;
  if (shouldSync && tenantId === DEFAULT_TENANT_ID) {
    syncResult = await reseedDemoTenantOrders();
  }

  const orders = await listOrdersByTenant(tenantId);
  const filtered = orders.filter((order) => {
    if (order.tenantId !== tenantId) return false;
    if (status && order.status !== status) return false;
    return true;
  });

  return NextResponse.json({
    tenantId,
    count: filtered.length,
    orders: filtered,
    sync: syncResult,
  });
}
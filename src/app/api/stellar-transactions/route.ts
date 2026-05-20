import { NextResponse } from "next/server";
import {
  countPaymentSnapshots,
  listPaymentSnapshots,
  listPersistedPaymentSnapshots,
} from "../../../../server/utils/paymentState";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_TENANT_ID = "demo-tenant-ph";

function isCanonicalDemoTransaction(row: {
  orderId?: string;
  amount?: number;
  tenantId?: string;
}) {
  if (row.tenantId !== DEFAULT_TENANT_ID) return true;
  const orderId = String(row.orderId || "").trim().toUpperCase();
  const amount = Number(row.amount || 0);
  return /^LPX\d{4}$/.test(orderId) && amount === 10.5;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId") || DEFAULT_TENANT_ID;
  const networkParam = searchParams.get("network");
  const statusParam = searchParams.get("status");
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;
  const limitParam = Number(searchParams.get("limit") || "20");
  const pageParam = Number(searchParams.get("page") || "1");

  const network =
    networkParam === "mainnet" || networkParam === "testnet" ? networkParam : undefined;
  const status = statusParam === "confirmed" || statusParam === "pending" ? statusParam : undefined;

  const limit = Number.isFinite(limitParam) ? limitParam : 20;
  const page = Number.isFinite(pageParam) ? pageParam : 1;

  const persisted = await listPersistedPaymentSnapshots({
    tenantId,
    network,
    status,
    startDate,
    endDate,
    limit,
    page,
  });

  const rawRows =
    persisted.items.length > 0
      ? persisted.items
      : listPaymentSnapshots({
          tenantId,
          network,
          status,
          startDate,
          endDate,
          limit,
          page,
        });

  const rawTotal =
    persisted.items.length > 0
      ? persisted.total
      : countPaymentSnapshots({
          tenantId,
          network,
          status,
          startDate,
          endDate,
        });

  const rows = rawRows.filter((row) =>
    isCanonicalDemoTransaction({
      orderId: row.orderId,
      amount: row.amount,
      tenantId,
    }),
  );

  const total = tenantId === DEFAULT_TENANT_ID ? rows.length : rawTotal;

  return NextResponse.json({
    tenantId,
    page,
    limit,
    count: rows.length,
    total,
    transactions: rows,
  });
}

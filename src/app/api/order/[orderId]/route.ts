import { NextResponse } from "next/server";
import { DEMO_TENANT_ID } from "../../../../lib/demoOrderSeed";
import { getOrderByTenantAndId } from "../../../../lib/demoOrderService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{
    orderId: string;
  }>;
};

export async function GET(_: Request, { params }: Params) {
  const { orderId } = await params;
  const order = await getOrderByTenantAndId(DEMO_TENANT_ID, orderId);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: order.id,
    amount: order.amount,
    tenantId: order.tenantId,
    branch: order.branch,
    status: order.status,
  });
}

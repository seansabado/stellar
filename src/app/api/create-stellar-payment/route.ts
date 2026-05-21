import { NextResponse } from "next/server";
import {
  createPendingPayment,
  getPaymentSnapshotFromDb,
  upsertPaymentSnapshot,
} from "../../../../server/utils/paymentState";
import {
  buildDeterministicPaymentId,
  createStellarPaymentRequest,
  submitDemoPayment,
} from "../../../../server/utils/stellar";
import { getOrderByTenantAndId } from "../../../lib/demoOrderService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const PAYMENT_INTENT_TTL_MS = 15 * 60 * 1000;

type CreatePaymentBody = {
  orderId?: string;
  amount?: number;
  tenantId?: string;
  network?: "testnet" | "mainnet";
};

export async function POST(request: Request) {
  const body = (await request.json()) as CreatePaymentBody;
  const { orderId, amount, tenantId, network: requestNetwork } = body;

  if (!orderId || !amount || !tenantId) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  try {
    const existingOrder = await getOrderByTenantAndId(tenantId, orderId);
    if (existingOrder?.status === "paid") {
      return NextResponse.json(
        {
          error: "Order already paid.",
          orderId,
          status: "paid",
        },
        { status: 409 },
      );
    }

    const deterministicPaymentId = buildDeterministicPaymentId(orderId);
    const existing = await getPaymentSnapshotFromDb(deterministicPaymentId, tenantId);
    if (existing?.status === "confirmed") {
      return NextResponse.json(
        {
          error: "Order already has a confirmed payment.",
          paymentId: existing.paymentId,
          orderId: existing.orderId,
          status: existing.status,
          txRef: existing.txRef,
          explorerUrl: existing.explorerUrl,
        },
        { status: 409 },
      );
    }

    const { qrData, paymentId, network, destinationAccount, assetCode, assetIssuer } = await createStellarPaymentRequest(
      orderId,
      amount,
      tenantId,
      requestNetwork,
    );
    const normalizedNetwork = network === "mainnet" ? "mainnet" : "testnet";
    const expiresAt = new Date(Date.now() + PAYMENT_INTENT_TTL_MS).toISOString();
    const snapshot = createPendingPayment({
      paymentId,
      orderId,
      tenantId,
      amount,
      network: normalizedNetwork,
      destinationAccount,
      assetCode,
      assetIssuer,
      expiresAt,
    });
    await upsertPaymentSnapshot(snapshot);

    // Demo: auto-submit a real testnet payment so the polling loop can confirm it.
    // Uses Friendbot to fund a fresh keypair — testnet only, fire-and-forget.
    if (normalizedNetwork === "testnet") {
      void submitDemoPayment({
        paymentId,
        amount: amount!,
        destinationAccount,
      }).catch((e: unknown) => {
        console.error("[demo-pay] Auto-submit failed:", String(e));
      });
    }

    return NextResponse.json({
      qrData,
      paymentId,
      network: normalizedNetwork,
      snapshot,
    });
  } catch {
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}

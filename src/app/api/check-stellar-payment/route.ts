import { NextResponse } from "next/server";
import {
  confirmPaymentSnapshotIfPending,
  getPaymentSnapshotFromDb,
  upsertPaymentSnapshot,
} from "../../../../server/utils/paymentState";
import { checkStellarPaymentStatus } from "../../../../server/utils/stellar";
import { markOrderPaidByTenantAndId } from "../../../lib/demoOrderService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("paymentId");
  const network = (searchParams.get("network") as "testnet" | "mainnet") || "testnet";

  if (!paymentId) {
    return NextResponse.json({ error: "Missing paymentId" }, { status: 400 });
  }

  try {
    // Load stored snapshot from Firestore (written at payment creation)
    const stored = await getPaymentSnapshotFromDb(paymentId);

    // If already confirmed in Firestore, return immediately
    if (stored?.status === "confirmed") {
      return NextResponse.json(stored);
    }

    if (stored?.expiresAt && Date.parse(stored.expiresAt) <= Date.now()) {
      return NextResponse.json({
        ...stored,
        status: "pending",
        verificationReason: "expired_intent",
      });
    }

    // Query Horizon and validate memo + destination + asset + amount
    const horizonResult = await checkStellarPaymentStatus({
      paymentId,
      network,
      expectedAmount: stored?.amount,
      destinationAccount: stored?.destinationAccount,
      assetCode: stored?.assetCode,
      assetIssuer: stored?.assetIssuer,
    });

    if (horizonResult.status === "confirmed") {
      const confirmedAt = horizonResult.confirmedAt ?? new Date().toISOString();
      const settled = await confirmPaymentSnapshotIfPending({
        paymentId,
        tenantId: stored?.tenantId || "demo-tenant-ph",
        buildConfirmed: (base) => ({
          ...(base ?? {
            paymentId,
            orderId: "unknown-order",
            tenantId: "demo-tenant-ph",
            amount: 0,
            network,
            checks: 0,
            timeline: [{ status: "pending" as const, at: new Date().toISOString() }],
          }),
          status: "confirmed" as const,
          verificationReason: "confirmed" as const,
          txRef: horizonResult.txRef,
          confirmedAt,
          paidAmount: horizonResult.paidAmount,
          sourceAccount: horizonResult.sourceAccount,
          destinationAccount: horizonResult.destinationAccount ?? base?.destinationAccount,
          assetCode: horizonResult.assetCode ?? base?.assetCode,
          assetIssuer: horizonResult.assetIssuer ?? base?.assetIssuer,
          ledger: horizonResult.ledger,
          explorerUrl: horizonResult.explorerUrl,
          timeline: [
            ...(base?.timeline ?? [{ status: "pending" as const, at: new Date().toISOString() }]),
            { status: "confirmed" as const, at: confirmedAt },
          ],
        }),
      });

      if (settled.transitioned) {
        await markOrderPaidByTenantAndId({
          tenantId: settled.snapshot.tenantId,
          orderId: settled.snapshot.orderId,
          paymentId: settled.snapshot.paymentId,
          txRef: settled.snapshot.txRef,
          network: settled.snapshot.network,
          paidAt: settled.snapshot.confirmedAt,
          paidAmount: settled.snapshot.paidAmount,
          sourceAccount: settled.snapshot.sourceAccount,
          destinationAccount: settled.snapshot.destinationAccount,
          assetCode: settled.snapshot.assetCode,
          assetIssuer: settled.snapshot.assetIssuer,
          ledger: settled.snapshot.ledger,
          explorerUrl: settled.snapshot.explorerUrl,
        });
      }

      return NextResponse.json(settled.snapshot);
    }

    // Still pending
    return NextResponse.json(
      {
        ...(stored ?? {
        paymentId,
        orderId: "unknown-order",
        tenantId: "demo-tenant-ph",
        amount: 0,
        network,
        status: "pending",
        timeline: [{ status: "pending", at: new Date().toISOString() }],
        checks: 0,
        }),
        status: "pending",
        verificationReason: horizonResult.pendingReason || stored?.verificationReason || "awaiting_chain",
      },
    );
  } catch {
    return NextResponse.json({ error: "Failed to check payment" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { listPersistedPaymentSnapshots, upsertPaymentSnapshot } from "../../../../server/utils/paymentState";
import { checkStellarPaymentStatus } from "../../../../server/utils/stellar";
import { markOrderPaidByTenantAndId } from "../../../lib/demoOrderService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReconcileBody = {
  tenantId?: string;
  network?: "testnet" | "mainnet";
  paymentIds?: string[];
  limit?: number;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ReconcileBody;
  const tenantId = body.tenantId || "demo-tenant-ph";
  const network = body.network === "mainnet" ? "mainnet" : "testnet";
  const limit = Math.max(1, Math.min(Number(body.limit || 100), 200));
  const requestedIds = new Set((body.paymentIds || []).filter(Boolean));

  const persisted = await listPersistedPaymentSnapshots({
    tenantId,
    network,
    status: "confirmed",
    limit,
    page: 1,
  });

  const candidates = persisted.items.filter((snapshot) => {
    if (requestedIds.size > 0) {
      return requestedIds.has(snapshot.paymentId);
    }
    return !snapshot.txRef || !snapshot.ledger || !snapshot.explorerUrl;
  });

  const reconciled: Array<{ paymentId: string; orderId: string; txRef?: string; ledger?: number }> = [];
  const unresolved: Array<{ paymentId: string; orderId: string; reason: string }> = [];

  for (const snapshot of candidates) {
    const chain = await checkStellarPaymentStatus({
      paymentId: snapshot.paymentId,
      network: snapshot.network,
      expectedAmount: snapshot.amount,
      destinationAccount: snapshot.destinationAccount,
      assetCode: snapshot.assetCode,
      assetIssuer: snapshot.assetIssuer,
    });

    if (chain.status !== "confirmed") {
      unresolved.push({
        paymentId: snapshot.paymentId,
        orderId: snapshot.orderId,
        reason: chain.pendingReason || "not_confirmed",
      });
      continue;
    }

    const confirmedAt = chain.confirmedAt || snapshot.confirmedAt || new Date().toISOString();
    const merged = {
      ...snapshot,
      status: "confirmed" as const,
      verificationReason: "confirmed" as const,
      txRef: chain.txRef || snapshot.txRef,
      confirmedAt,
      paidAmount: chain.paidAmount || snapshot.paidAmount,
      sourceAccount: chain.sourceAccount || snapshot.sourceAccount,
      destinationAccount: chain.destinationAccount || snapshot.destinationAccount,
      assetCode: chain.assetCode || snapshot.assetCode,
      assetIssuer: chain.assetIssuer || snapshot.assetIssuer,
      ledger: chain.ledger || snapshot.ledger,
      explorerUrl: chain.explorerUrl || snapshot.explorerUrl,
      timeline: [
        ...(snapshot.timeline || [{ status: "pending" as const, at: confirmedAt }]),
        { status: "confirmed" as const, at: confirmedAt },
      ],
      checks: Math.max(snapshot.checks || 0, 1),
    };

    await upsertPaymentSnapshot(merged);

    await markOrderPaidByTenantAndId({
      tenantId: merged.tenantId,
      orderId: merged.orderId,
      paymentId: merged.paymentId,
      txRef: merged.txRef,
      network: merged.network,
      paidAt: merged.confirmedAt,
      paidAmount: merged.paidAmount,
      sourceAccount: merged.sourceAccount,
      destinationAccount: merged.destinationAccount,
      assetCode: merged.assetCode,
      assetIssuer: merged.assetIssuer,
      ledger: merged.ledger,
      explorerUrl: merged.explorerUrl,
    });

    reconciled.push({
      paymentId: merged.paymentId,
      orderId: merged.orderId,
      txRef: merged.txRef,
      ledger: merged.ledger,
    });
  }

  return NextResponse.json({
    tenantId,
    network,
    requested: requestedIds.size,
    scanned: candidates.length,
    reconciledCount: reconciled.length,
    unresolvedCount: unresolved.length,
    reconciled,
    unresolved,
  });
}

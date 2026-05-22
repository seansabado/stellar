import { NextResponse } from "next/server";
import { queryPaymentOnChain } from "../../../../../server/utils/stellar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/contract/verify?orderId=<ORDER_ID>
 *
 * Queries the on-chain PaymentRegistry Soroban contract for a confirmed
 * payment record. Judges can use this to independently verify any demo
 * payment without trusting our database.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");

  if (!orderId || orderId.trim() === "") {
    return NextResponse.json({ error: "Missing orderId query parameter" }, { status: 400 });
  }

  const contractId = process.env.SOROBAN_CONTRACT_ID;
  const activeNetwork = process.env.STELLAR_NETWORK === "mainnet" ? "mainnet" : "testnet";

  if (!contractId) {
    return NextResponse.json(
      { error: "Soroban contract not configured on this deployment" },
      { status: 503 },
    );
  }

  try {
    const record = await queryPaymentOnChain(orderId.trim());

    if (!record) {
      return NextResponse.json({ found: false, orderId });
    }

    return NextResponse.json({
      found: true,
      orderId,
      record,
      contract: {
        id: contractId,
        network: activeNetwork,
        explorerUrl: `https://stellar.expert/explorer/${activeNetwork}/contract/${contractId}`,
        labUrl: `https://lab.stellar.org/r/${activeNetwork}/contract/${contractId}`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Contract query failed", detail: message },
      { status: 500 },
    );
  }
}


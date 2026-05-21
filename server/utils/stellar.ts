import {
  Asset,
  BASE_FEE,
  Contract,
  Horizon,
  Keypair,
  Memo,
  Networks,
  nativeToScVal,
  Operation,
  Soroban,
  TransactionBuilder,
} from "@stellar/stellar-sdk";

// ── Soroban: record a confirmed payment on-chain ──────────────────────────────
async function recordPaymentOnChain(params: {
  orderId: string;
  amountStroops: bigint;
  payerAddress: string;
  txHash: string;
  network: "testnet" | "mainnet";
}): Promise<string | null> {
  const contractId = process.env.SOROBAN_CONTRACT_ID;
  const rpcUrl =
    process.env.SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";
  const secret =
    params.network === "mainnet"
      ? process.env.STELLAR_SECRET_MAINNET
      : process.env.STELLAR_SECRET_TESTNET;

  if (!contractId || !secret) {
    console.warn("[soroban] Missing SOROBAN_CONTRACT_ID or secret — skipping.");
    return null;
  }

  try {
    const keypair = Keypair.fromSecret(secret);
    const rpc = new Soroban.Server(rpcUrl);
    const account = await rpc.getAccount(keypair.publicKey());
    const networkPassphrase =
      params.network === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;

    const contract = new Contract(contractId);
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase,
    })
      .addOperation(
        contract.call(
          "record",
          nativeToScVal(params.orderId, { type: "string" }),
          nativeToScVal(params.amountStroops, { type: "i128" }),
          nativeToScVal(params.payerAddress, { type: "string" }),
          nativeToScVal(params.txHash, { type: "string" }),
          nativeToScVal(params.network, { type: "string" }),
        ),
      )
      .setTimeout(30)
      .build();

    const simResult = await rpc.simulateTransaction(tx);
    if (!Soroban.Api.isSimulationSuccess(simResult)) {
      console.error("[soroban] Simulation failed:", JSON.stringify(simResult));
      return null;
    }

    const preparedTx = Soroban.assembleTransaction(tx, simResult).build();
    preparedTx.sign(keypair);

    const sendResult = await rpc.sendTransaction(preparedTx);
    console.log(`[soroban] Payment recorded on-chain: ${sendResult.hash}`);
    return sendResult.hash;
  } catch (err) {
    // Non-blocking: log but do not fail the payment confirmation flow
    console.error("[soroban] Contract call failed:", err);
    return null;
  }
}

// ── Soroban: read a payment record from on-chain (judge verification) ─────────
export async function queryPaymentOnChain(
  orderId: string,
): Promise<null | {
  orderId: string;
  amountXLM: string;
  amountStroops: number;
  payer: string;
  txHash: string;
  network: string;
  recordedAt: unknown;
}> {
  const contractId = process.env.SOROBAN_CONTRACT_ID;
  const rpcUrl =
    process.env.SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";
  const sourcePublicKey = process.env.STELLAR_PUBLIC_TESTNET;

  if (!contractId || !sourcePublicKey) return null;

  try {
    const rpc = new Soroban.Server(rpcUrl);
    const account = await rpc.getAccount(sourcePublicKey);

    const contract = new Contract(contractId);
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        contract.call("get", nativeToScVal(orderId.trim(), { type: "string" })),
      )
      .setTimeout(30)
      .build();

    const simResult = await rpc.simulateTransaction(tx);
    if (!Soroban.Api.isSimulationSuccess(simResult)) return null;

    const retval = simResult.result?.retval;
    if (!retval) return null;

    // scValToNative returns null for Option::None, struct object for Some
    const native = scValToNative(retval) as Record<string, unknown> | null;
    if (!native) return null;

    const amountStroops =
      typeof native.amount_stroops === "bigint"
        ? Number(native.amount_stroops)
        : Number(native.amount_stroops ?? 0);

    return {
      orderId: native.order_id as string,
      amountXLM: (amountStroops / 10_000_000).toFixed(7),
      amountStroops,
      payer: native.payer as string,
      txHash: native.tx_hash as string,
      network: native.network as string,
      recordedAt: native.recorded_at,
    };
  } catch {
    return null;
  }
}

const getNetworkConfig = () => {
  const network =
    process.env.STELLAR_NETWORK === "mainnet" ? "mainnet" : "testnet";
  return {
    network,
    horizonUrl:
      network === "mainnet"
        ? process.env.HORIZON_URL_MAINNET
        : process.env.HORIZON_URL_TESTNET,
    secret:
      network === "mainnet"
        ? process.env.STELLAR_SECRET_MAINNET
        : process.env.STELLAR_SECRET_TESTNET,
    publicKey:
      network === "mainnet"
        ? process.env.STELLAR_PUBLIC_MAINNET
        : process.env.STELLAR_PUBLIC_TESTNET,
    usdc:
      network === "mainnet"
        ? process.env.USDC_MAINNET
        : process.env.USDC_TESTNET,
  };
};

function isValidStellarAccount(value?: string): boolean {
  if (!value) return false;
  return /^G[A-Z2-7]{55}$/.test(value);
}

function sanitizeMemoToken(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
}

export function buildDeterministicPaymentId(orderId: string): string {
  const orderToken = sanitizeMemoToken(orderId);
  const memo = orderToken ? `PAY-${orderToken}` : "PAY-UNKNOWN";
  return memo.slice(0, 28);
}

export async function createStellarPaymentRequest(
  orderId: string,
  amount: number,
  tenantId: string,
  requestNetwork?: "testnet" | "mainnet",
) {
  const overrideNetwork = requestNetwork || undefined;
  const config = getNetworkConfig();
  const network = overrideNetwork || config.network;
  const horizonUrl = overrideNetwork
    ? overrideNetwork === "mainnet"
      ? process.env.HORIZON_URL_MAINNET
      : process.env.HORIZON_URL_TESTNET
    : config.horizonUrl;
  const publicKey = overrideNetwork
    ? overrideNetwork === "mainnet"
      ? process.env.STELLAR_PUBLIC_MAINNET
      : process.env.STELLAR_PUBLIC_TESTNET
    : config.publicKey;
  const usdc = overrideNetwork
    ? overrideNetwork === "mainnet"
      ? process.env.USDC_MAINNET
      : process.env.USDC_TESTNET
    : config.usdc;
  const paymentId = buildDeterministicPaymentId(orderId);
  const destinationAccount = publicKey || "";
  // On testnet use XLM (no trustline needed for demo auto-submit).
  // On mainnet use USDC if configured.
  const useUsdc = network === "mainnet" && isValidStellarAccount(usdc);
  const assetCode = useUsdc ? "USDC" : "XLM";
  const assetIssuer = useUsdc ? (usdc || "") : "";
  // SEP-7: stellar://pay?destination=...&amount=...&asset_code=USDC&memo=...
  const qrData =
    `stellar://pay?destination=${destinationAccount}` +
    `&amount=${amount}` +
    (assetCode === "USDC"
      ? `&asset_code=${assetCode}&asset_issuer=${assetIssuer}`
      : "") +
    `&memo=${paymentId}`;
  // TODO: Save paymentId/orderId/tenantId to Firestore with status 'pending'
  return { qrData, paymentId, network, destinationAccount, assetCode, assetIssuer };
}

type PaymentCheckInput = {
  paymentId: string;
  network?: "testnet" | "mainnet";
  expectedAmount?: number;
  destinationAccount?: string;
  assetCode?: string;
  assetIssuer?: string;
};

type PaymentCheckResult = {
  status: "pending" | "confirmed";
  pendingReason?: "tx_not_found" | "operation_mismatch" | "horizon_unavailable" | "invalid_config";
  txRef?: string;
  confirmedAt?: string;
  paidAmount?: string;
  sourceAccount?: string;
  destinationAccount?: string;
  assetCode?: string;
  assetIssuer?: string;
  ledger?: number;
  explorerUrl?: string;
};

function amountMatches(expected?: number, actual?: string): boolean {
  if (typeof expected !== "number" || !actual) return true;
  const parsed = Number(actual);
  if (!Number.isFinite(parsed)) return false;
  return Math.abs(parsed - expected) <= 0.000001;
}

export async function checkStellarPaymentStatus(
  input: PaymentCheckInput,
): Promise<PaymentCheckResult> {
  const network = input.network || "testnet";
  const horizonUrl = network === "mainnet"
    ? process.env.HORIZON_URL_MAINNET
    : process.env.HORIZON_URL_TESTNET;
  const publicKey = network === "mainnet"
    ? process.env.STELLAR_PUBLIC_MAINNET
    : process.env.STELLAR_PUBLIC_TESTNET;
  const expectedDestination = input.destinationAccount || publicKey || "";
  // Default to XLM (native) on testnet since demo payments use XLM — not USDC
  const expectedAssetCode = input.assetCode || (network === "testnet" ? "XLM" : "USDC");
  const expectedAssetIssuer = input.assetIssuer || (network === "mainnet"
    ? process.env.USDC_MAINNET
    : process.env.USDC_TESTNET) || "";

  if (!horizonUrl || !publicKey || !expectedDestination) {
    return { status: "pending", pendingReason: "invalid_config" };
  }

  try {
    const server = new Horizon.Server(horizonUrl);
    const txPage = await server.transactions()
      .forAccount(publicKey)
      .order("desc")
      .limit(100)
      .call();

    const memoMatches = txPage.records.filter(
      (tx) => tx.memo === input.paymentId && tx.successful,
    );

    if (memoMatches.length === 0) {
      return { status: "pending", pendingReason: "tx_not_found" };
    }

    for (const tx of memoMatches) {
      const opPage = await server.operations().forTransaction(tx.hash).limit(200).call();
      const paymentOp = opPage.records.find((op) => {
        if (op.type !== "payment") return false;
        const to = (op as { to?: string }).to;
        const assetType = (op as { asset_type?: string }).asset_type;
        const assetCode = (op as { asset_code?: string }).asset_code;
        const assetIssuer = (op as { asset_issuer?: string }).asset_issuer;
        const amount = (op as { amount?: string }).amount;

        const destinationOk = to === expectedDestination;
        const amountOk = amountMatches(input.expectedAmount, amount);

        if (expectedAssetCode === "XLM") {
          return destinationOk && amountOk && assetType === "native";
        }

        return destinationOk
          && amountOk
          && assetCode === expectedAssetCode
          && assetIssuer === expectedAssetIssuer;
      });

      if (paymentOp) {
        const sourceAccount = (paymentOp as { from?: string }).from;
        const paidAmount = (paymentOp as { amount?: string }).amount;
        const assetType = (paymentOp as { asset_type?: string }).asset_type;
        const matchedAssetCode = assetType === "native"
          ? "XLM"
          : (paymentOp as { asset_code?: string }).asset_code;
        const matchedAssetIssuer = (paymentOp as { asset_issuer?: string }).asset_issuer;

        // Fire-and-forget: record this confirmed payment on the Soroban contract
        const stroops = paidAmount
          ? BigInt(Math.round(parseFloat(paidAmount) * 10_000_000))
          : BigInt(0);
        recordPaymentOnChain({
          orderId: input.paymentId,
          amountStroops: stroops,
          payerAddress: sourceAccount || "",
          txHash: tx.hash,
          network,
        }).catch((err) =>
          console.error("[soroban] Background record failed:", err),
        );

        return {
          status: "confirmed",
          txRef: tx.hash,
          confirmedAt: tx.created_at,
          paidAmount,
          sourceAccount,
          destinationAccount: expectedDestination,
          assetCode: matchedAssetCode,
          assetIssuer: matchedAssetIssuer,
          ledger: tx.ledger_attr,
          explorerUrl: `https://stellar.expert/explorer/${network}/tx/${tx.hash}`,
        };
      }
    }

    return { status: "pending", pendingReason: "operation_mismatch" };
  } catch {
    return { status: "pending", pendingReason: "horizon_unavailable" };
  }
}

/**
 * Demo-only: funds a fresh testnet keypair via Friendbot and sends an XLM
 * payment to the merchant destination with the correct memo so the polling
 * loop can confirm it automatically.  Never call this on mainnet.
 */
export async function submitDemoPayment({
  paymentId,
  amount,
  destinationAccount,
}: {
  paymentId: string;
  amount: number;
  destinationAccount: string;
}): Promise<void> {
  const horizonUrl =
    process.env.HORIZON_URL_TESTNET || "https://horizon-testnet.stellar.org";

  // Generate a fresh one-time sender keypair
  const senderKeypair = Keypair.random();
  const senderPublicKey = senderKeypair.publicKey();

  // Fund via Friendbot (testnet only)
  const friendbotRes = await fetch(
    `https://friendbot.stellar.org/?addr=${senderPublicKey}`,
  );
  if (!friendbotRes.ok) {
    throw new Error(`Friendbot failed with status ${friendbotRes.status}`);
  }

  const server = new Horizon.Server(horizonUrl);
  const senderAccount = await server.loadAccount(senderPublicKey);

  const tx = new TransactionBuilder(senderAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination: destinationAccount,
        asset: Asset.native(), // XLM — no trustline needed
        amount: amount.toFixed(7),
      }),
    )
    .addMemo(Memo.text(paymentId))
    .setTimeout(60)
    .build();

  tx.sign(senderKeypair);
  await server.submitTransaction(tx);

  console.log(
    `[demo-pay] ✓ Submitted XLM ${amount} → ${destinationAccount} memo=${paymentId}`,
  );
}

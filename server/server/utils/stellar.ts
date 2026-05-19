import {
  Keypair,
  Server,
  TransactionBuilder,
  Networks,
  Asset,
  Memo,
} from "stellar-sdk";
import { v4 as uuidv4 } from "uuid";

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

export async function createStellarPaymentRequest(
  orderId: string,
  amount: number,
  tenantId: string,
) {
  const { network, horizonUrl, publicKey, usdc } = getNetworkConfig();
  const paymentId = uuidv4();
  // SEP-7: stellar://pay?destination=...&amount=...&asset_code=USDC&memo=...
  const qrData =
    `stellar://pay?destination=${publicKey}` +
    `&amount=${amount}` +
    `&asset_code=USDC` +
    `&asset_issuer=${usdc}` +
    `&memo=${paymentId}`;
  // TODO: Save paymentId/orderId/tenantId to Firestore with status 'pending'
  return { qrData, paymentId, network };
}

export async function checkStellarPaymentStatus(
  paymentId: string,
): Promise<"pending" | "confirmed"> {
  // TODO: Query Horizon for payment with memo = paymentId
  // If found, update Firestore order status to 'paid', return 'confirmed'
  // Else, return 'pending'
  return "pending";
}

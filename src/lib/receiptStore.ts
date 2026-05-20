export interface PaymentReceipt {
  orderId: string;
  amount: number;
  tenantId: string;
  network: "testnet" | "mainnet";
  paymentId: string;
  txRef?: string;
  paidAt: string;
  explorerUrl?: string;
  ledger?: number;
  paidAmount?: string;
  assetCode?: string;
  assetIssuer?: string;
  sourceAccount?: string;
  destinationAccount?: string;
}

const RECEIPTS_KEY = "stellarpay.receipts.v1";

function readReceipts(): PaymentReceipt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECEIPTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PaymentReceipt[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeReceipts(receipts: PaymentReceipt[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RECEIPTS_KEY, JSON.stringify(receipts));
}

export function getReceipts(): PaymentReceipt[] {
  return readReceipts().sort((a, b) =>
    a.paidAt < b.paidAt ? 1 : a.paidAt > b.paidAt ? -1 : 0,
  );
}

export function saveReceipt(receipt: PaymentReceipt): void {
  const receipts = readReceipts();
  const existing = receipts.findIndex((item) => item.orderId === receipt.orderId);
  if (existing >= 0) {
    receipts[existing] = receipt;
  } else {
    receipts.unshift(receipt);
  }
  writeReceipts(receipts);
}

export function clearReceipts(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(RECEIPTS_KEY);
}

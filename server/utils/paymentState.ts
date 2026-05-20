import { getAdminDb } from "../../src/lib/firebaseAdmin";

type PaymentStatus = "pending" | "confirmed";

export type VerificationReason =
  | "awaiting_chain"
  | "tx_not_found"
  | "operation_mismatch"
  | "horizon_unavailable"
  | "invalid_config"
  | "expired_intent"
  | "confirmed";

type TimelineItem = {
  status: PaymentStatus;
  at: string;
};

export type PaymentSnapshot = {
  paymentId: string;
  orderId: string;
  tenantId: string;
  amount: number;
  network: "testnet" | "mainnet";
  status: PaymentStatus;
  verificationReason?: VerificationReason;
  timeline: TimelineItem[];
  destinationAccount?: string;
  assetCode?: string;
  assetIssuer?: string;
  paidAmount?: string;
  sourceAccount?: string;
  ledger?: number;
  explorerUrl?: string;
  txRef?: string;
  confirmedAt?: string;
  expiresAt?: string;
  checks: number;
};

export type PaymentHistoryQuery = {
  tenantId?: string;
  network?: "testnet" | "mainnet";
  status?: PaymentStatus;
  limit?: number;
  page?: number;
  startDate?: string;
  endDate?: string;
};

type PaymentRecord = PaymentSnapshot & {
  createdAt: string;
};

const payments = new Map<string, PaymentRecord>();

const AUTO_CONFIRM_POLLS = Number(process.env.DEMO_AUTO_CONFIRM_POLLS || 2);

const TX_COLLECTION = "stellar_transactions";

function buildTxRef(paymentId: string): string {
  return `STLR-${paymentId.replace(/-/g, "").slice(0, 12).toUpperCase()}`;
}

export function createPendingPayment(input: {
  paymentId: string;
  orderId: string;
  tenantId: string;
  amount: number;
  network: "testnet" | "mainnet";
  destinationAccount?: string;
  assetCode?: string;
  assetIssuer?: string;
  expiresAt?: string;
}): PaymentSnapshot {
  const now = new Date().toISOString();
  const existing = payments.get(input.paymentId);
  if (existing) {
    return toSnapshot(existing);
  }

  const record: PaymentRecord = {
    paymentId: input.paymentId,
    orderId: input.orderId,
    tenantId: input.tenantId,
    amount: input.amount,
    network: input.network,
    status: "pending",
    verificationReason: "awaiting_chain",
    timeline: [{ status: "pending", at: now }],
    destinationAccount: input.destinationAccount,
    assetCode: input.assetCode,
    assetIssuer: input.assetIssuer,
    expiresAt: input.expiresAt,
    checks: 0,
    createdAt: now,
  };

  payments.set(input.paymentId, record);
  return toSnapshot(record);
}

export function getOrUpdatePaymentStatus(
  paymentId: string,
  network: "testnet" | "mainnet" = "testnet",
): PaymentSnapshot {
  const record = payments.get(paymentId);
  if (!record) {
    return {
      paymentId,
      orderId: "unknown-order",
      tenantId: "demo-tenant-ph",
      amount: 0,
      network,
      status: "pending",
      timeline: [{ status: "pending", at: new Date().toISOString() }],
      checks: 0,
    };
  }

  record.checks += 1;
  if (record.status !== "confirmed" && record.checks >= AUTO_CONFIRM_POLLS) {
    const confirmedAt = new Date().toISOString();
    record.status = "confirmed";
    record.confirmedAt = confirmedAt;
    record.txRef = buildTxRef(paymentId);
    record.timeline.push({ status: "confirmed", at: confirmedAt });
  }

  return toSnapshot(record);
}

function toSnapshot(record: PaymentRecord): PaymentSnapshot {
  return {
    paymentId: record.paymentId,
    orderId: record.orderId,
    tenantId: record.tenantId,
    amount: record.amount,
    network: record.network,
    status: record.status,
    verificationReason: record.verificationReason,
    timeline: [...record.timeline],
    destinationAccount: record.destinationAccount,
    assetCode: record.assetCode,
    assetIssuer: record.assetIssuer,
    paidAmount: record.paidAmount,
    sourceAccount: record.sourceAccount,
    ledger: record.ledger,
    explorerUrl: record.explorerUrl,
    txRef: record.txRef,
    confirmedAt: record.confirmedAt,
    expiresAt: record.expiresAt,
    checks: record.checks,
  };
}

export function listPaymentSnapshots(query: PaymentHistoryQuery = {}): PaymentSnapshot[] {
  const { tenantId, network, status, limit = 20, page = 1, startDate, endDate } = query;
  const cappedLimit = Math.max(1, Math.min(limit, 100));
  const pageIndex = Math.max(1, page);
  const start = (pageIndex - 1) * cappedLimit;
  const end = start + cappedLimit;
  const startMs = startDate ? Date.parse(startDate) : Number.NEGATIVE_INFINITY;
  const endMs = endDate ? Date.parse(endDate) : Number.POSITIVE_INFINITY;

  return Array.from(payments.values())
    .filter((record) => {
      if (tenantId && record.tenantId !== tenantId) return false;
      if (network && record.network !== network) return false;
      if (status && record.status !== status) return false;
      const timestamp = record.confirmedAt || record.createdAt;
      const tsMs = Date.parse(timestamp);
      if (!Number.isFinite(tsMs)) return false;
      if (tsMs < startMs || tsMs > endMs) return false;
      return true;
    })
    .sort((a, b) => {
      const aTime = a.confirmedAt || a.createdAt;
      const bTime = b.confirmedAt || b.createdAt;
      return aTime < bTime ? 1 : aTime > bTime ? -1 : 0;
    })
    .slice(start, end)
    .map((record) => toSnapshot(record));
}

export function countPaymentSnapshots(query: PaymentHistoryQuery = {}): number {
  const { tenantId, network, status, startDate, endDate } = query;
  const startMs = startDate ? Date.parse(startDate) : Number.NEGATIVE_INFINITY;
  const endMs = endDate ? Date.parse(endDate) : Number.POSITIVE_INFINITY;

  return Array.from(payments.values()).filter((record) => {
    if (tenantId && record.tenantId !== tenantId) return false;
    if (network && record.network !== network) return false;
    if (status && record.status !== status) return false;
    const timestamp = record.confirmedAt || record.createdAt;
    const tsMs = Date.parse(timestamp);
    if (!Number.isFinite(tsMs)) return false;
    if (tsMs < startMs || tsMs > endMs) return false;
    return true;
  }).length;
}

function getTxDocPath(tenantId: string, paymentId: string): string {
  return `tenants/${tenantId}/${TX_COLLECTION}/${paymentId}`;
}

export async function getPaymentSnapshotFromDb(
  paymentId: string,
  tenantId = "demo-tenant-ph",
): Promise<PaymentSnapshot | null> {
  try {
    const db = getAdminDb();
    const doc = await db.doc(getTxDocPath(tenantId, paymentId)).get();
    if (!doc.exists) return null;
    return doc.data() as PaymentSnapshot;
  } catch {
    return null;
  }
}

export async function upsertPaymentSnapshot(snapshot: PaymentSnapshot): Promise<void> {
  try {
    const db = getAdminDb();
    await db.doc(getTxDocPath(snapshot.tenantId, snapshot.paymentId)).set(
      {
        ...snapshot,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
  } catch {
    // Ignore persistence failures in demo mode; in-memory state remains source of truth.
  }
}

export async function confirmPaymentSnapshotIfPending(input: {
  paymentId: string;
  tenantId: string;
  buildConfirmed: (base: PaymentSnapshot | null) => PaymentSnapshot;
}): Promise<{ snapshot: PaymentSnapshot; transitioned: boolean }> {
  const { paymentId, tenantId, buildConfirmed } = input;
  const db = getAdminDb();
  const docRef = db.doc(getTxDocPath(tenantId, paymentId));

  const result = await db.runTransaction(async (tx) => {
    const snap = await tx.get(docRef);
    const existing = snap.exists ? (snap.data() as PaymentSnapshot) : null;

    if (existing?.status === "confirmed") {
      return { snapshot: existing, transitioned: false };
    }

    const confirmed = buildConfirmed(existing);
    tx.set(
      docRef,
      {
        ...confirmed,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    return { snapshot: confirmed, transitioned: true };
  });

  return result;
}

export async function listPersistedPaymentSnapshots(
  query: PaymentHistoryQuery = {},
): Promise<{ items: PaymentSnapshot[]; total: number }> {
  const { tenantId = "demo-tenant-ph", network, status, limit = 20, page = 1, startDate, endDate } = query;
  const cappedLimit = Math.max(1, Math.min(limit, 100));
  const pageIndex = Math.max(1, page);
  const startMs = startDate ? Date.parse(startDate) : Number.NEGATIVE_INFINITY;
  const endMs = endDate ? Date.parse(endDate) : Number.POSITIVE_INFINITY;

  try {
    const db = getAdminDb();
    const snap = await db.collection(`tenants/${tenantId}/${TX_COLLECTION}`).get();

    const rows = snap.docs
      .map((doc) => doc.data() as PaymentSnapshot)
      .filter((record) => {
        if (network && record.network !== network) return false;
        if (status && record.status !== status) return false;
        const timestamp = record.confirmedAt || record.timeline?.[0]?.at;
        const tsMs = timestamp ? Date.parse(timestamp) : Number.NaN;
        if (!Number.isFinite(tsMs)) return false;
        if (tsMs < startMs || tsMs > endMs) return false;
        return true;
      })
      .sort((a, b) => {
        const aTime = a.confirmedAt || a.timeline?.[0]?.at || "";
        const bTime = b.confirmedAt || b.timeline?.[0]?.at || "";
        return aTime < bTime ? 1 : aTime > bTime ? -1 : 0;
      });

    const total = rows.length;
    const start = (pageIndex - 1) * cappedLimit;
    const end = start + cappedLimit;

    return {
      items: rows.slice(start, end),
      total,
    };
  } catch {
    return {
      items: [],
      total: 0,
    };
  }
}

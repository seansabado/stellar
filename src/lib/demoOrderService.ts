import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { demoOrders, type CustomerOrder } from "./customerData";
import { DEMO_SEED_ORDERS, DEMO_TENANT_ID } from "./demoOrderSeed";
import { getAdminDb } from "./firebaseAdmin";
import { toDisplayBranchName } from "./branchDisplay";

function toCollectionPath(tenantId: string) {
  return `tenants/${tenantId}/stellar_demo_orders`;
}

function toSaasOrdersCollectionGroupName() {
  return "orders";
}

function toCustomerOrder(record: Record<string, unknown>, fallbackId: string): CustomerOrder {
  const opsStatus =
    record.opsStatus === "delivered" || record.opsStatus === "ready"
      ? (record.opsStatus as "ready" | "delivered")
      : record.sourceStatus === "delivered" || record.sourceStatus === "ready"
        ? (record.sourceStatus as "ready" | "delivered")
        : record.status === "paid"
          ? "delivered"
          : "ready";

  return {
    id: String(record.id || fallbackId),
    displayOrderId: String(
      record.displayOrderId ||
        record.orderNumber ||
        record.orderNo ||
        record.orderId ||
        record.id ||
        fallbackId,
    ),
    amount: Number(record.amount || record.total || 0),
    tenantId: String(record.tenantId || DEMO_TENANT_ID),
    branchId: typeof record.branchId === "string" ? record.branchId : undefined,
    branch: String(record.branch || record.branchId || "Demo Branch"),
    service: String(record.service || "Laundry Service"),
    status: record.status === "paid" ? "paid" : "unpaid",
    pickupEta: String(record.pickupEta || "TBD"),
    sourceStatus: opsStatus,
    opsStatus,
  };
}

function mapSaasOrderDocToCustomerOrder(
  id: string,
  record: Record<string, unknown>,
): CustomerOrder {
  const items = Array.isArray(record.items) ? record.items : [];
  const firstItem = items.length > 0 && typeof items[0] === "object" ? items[0] : null;
  const firstItemRecord = (firstItem || {}) as Record<string, unknown>;

  const payment =
    record.payment && typeof record.payment === "object"
      ? (record.payment as Record<string, unknown>)
      : null;
  const billing =
    record.billing && typeof record.billing === "object"
      ? (record.billing as Record<string, unknown>)
      : null;

  const amount = Number(
    billing?.totalDue ||
      record.total ||
      record.amount ||
      firstItemRecord.subtotal ||
      0,
  );
  const service = String(
    firstItemRecord.serviceName ||
      firstItemRecord.serviceId ||
      firstItemRecord.name ||
      record.service ||
      "Laundry Service",
  );
  const branchId =
    typeof record.branchId === "string" && record.branchId.trim().length > 0
      ? record.branchId
      : undefined;
  const branch = toDisplayBranchName({
    branchId,
    branchName: String(record.branchName || record.branch || record.branchId || "Demo Branch"),
  });
  const opsStatus =
    record.opsStatus === "delivered" || record.opsStatus === "ready"
      ? (record.opsStatus as "ready" | "delivered")
      : record.status === "delivered" || record.status === "ready"
        ? (record.status as "ready" | "delivered")
        : payment?.isVerified === true
          ? "delivered"
          : "ready";
  const pickupEta = String(
    record.pickupEta ||
      record.expectedReadyAt ||
      record.readyAt ||
      record.createdAt ||
      "Processing",
  );
  const status = payment?.isVerified === true ? "paid" : "unpaid";

  return {
    id,
    displayOrderId: String(
      record.displayOrderId || record.orderNumber || record.orderNo || record.orderId || id,
    ),
    amount,
    tenantId: String(record.tenantId || DEMO_TENANT_ID),
    branch,
    branchId,
    service,
    status,
    pickupEta,
    sourceStatus: opsStatus,
    opsStatus,
  };
}

async function listSaasOrdersByTenant(tenantId: string): Promise<CustomerOrder[]> {
  const db = getAdminDb();
  const branchesSnap = await db.collection(`tenants/${tenantId}/branches`).get();
  if (branchesSnap.empty) return [];

  const rows: CustomerOrder[] = [];

  for (const branchDoc of branchesSnap.docs) {
    const branchId = branchDoc.id;
    const branchData = branchDoc.data() as Record<string, unknown>;
    const branchName = String(branchData.name || branchData.branchName || branchId);

    const ordersSnap = await db
      .collection(`tenants/${tenantId}/branches/${branchId}/${toSaasOrdersCollectionGroupName()}`)
      .get();

    for (const orderDoc of ordersSnap.docs) {
      const mapped = mapSaasOrderDocToCustomerOrder(
        orderDoc.id,
        orderDoc.data() as Record<string, unknown>,
      );
      rows.push({
        ...mapped,
        tenantId,
        branch:
          mapped.branch === "Demo Branch"
            ? toDisplayBranchName({ branchId, branchName })
            : mapped.branch,
      });
    }
  }

  if (rows.length === 0) return [];

  rows.sort((a, b) => a.id.localeCompare(b.id));

  return rows;
}

function toBranchId(branchName: string): string {
  return branchName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "demo-branch";
}

function resolveBranchId(order: CustomerOrder): string {
  if (typeof order.branchId === "string" && order.branchId.trim().length > 0) {
    return order.branchId.trim();
  }
  return toBranchId(order.branch || "Demo Branch");
}

async function writeDemoTenantOrders(tenantId: string, orders: CustomerOrder[]) {
  const db = getAdminDb();
  const mirrorRef = db.collection(toCollectionPath(tenantId));
  const branchesRef = db.collection(`tenants/${tenantId}/branches`);

  const clearCollection = async (collectionRef: FirebaseFirestore.Query<FirebaseFirestore.DocumentData, FirebaseFirestore.DocumentData>) => {
    const existing = await collectionRef.get();
    if (existing.empty) return;

    let deleteBatch = db.batch();
    let pendingDeletes = 0;
    for (const doc of existing.docs) {
      deleteBatch.delete(doc.ref);
      pendingDeletes += 1;
      if (pendingDeletes === 400) {
        await deleteBatch.commit();
        deleteBatch = db.batch();
        pendingDeletes = 0;
      }
    }
    if (pendingDeletes > 0) {
      await deleteBatch.commit();
    }
  };

  await clearCollection(mirrorRef);

  // Clear existing branch order subcollections before deleting branch docs.
  // Deleting branch docs alone leaves stale orders in the subcollections.
  const existingBranches = await branchesRef.get();
  for (const branchDoc of existingBranches.docs) {
    const branchOrdersRef = db.collection(`tenants/${tenantId}/branches/${branchDoc.id}/orders`);
    await clearCollection(branchOrdersRef);
  }

  await clearCollection(branchesRef);

  if (orders.length === 0) return;

  const batch = db.batch();
  for (const [index, order] of orders.entries()) {
    const branchId = resolveBranchId(order);
    const payment = order.status === "paid"
      ? {
          isVerified: true,
          paymentId: `seed-${order.id}`,
          txRef: `STLR-${order.id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}`,
          network: "testnet",
          verifiedAt: new Date().toISOString(),
        }
      : {
          isVerified: false,
          paymentId: null,
          txRef: null,
          network: "testnet",
        };

    batch.set(mirrorRef.doc(order.id), {
      ...order,
      branchId,
      payment,
      sourceStatus: order.opsStatus || (order.status === "paid" ? "delivered" : "ready"),
      sortIndex: index + 1,
      mirroredAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    batch.set(branchesRef.doc(branchId), {
      name: order.branch,
      branchName: order.branch,
      active: true,
      tenantId,
      sortIndex: branchId === "branch-hq" ? 1 : 2,
      seededAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    batch.set(db.doc(`tenants/${tenantId}/branches/${branchId}/orders/${order.id}`), {
      id: order.id,
      displayOrderId: order.id,
      amount: order.amount,
      tenantId,
      branchId,
      branchName: order.branch,
      service: order.service,
      status: order.opsStatus || (order.status === "paid" ? "delivered" : "ready"),
      opsStatus: order.opsStatus || (order.status === "paid" ? "delivered" : "ready"),
      pickupEta: order.pickupEta,
      payment,
      sortIndex: index + 1,
      seededAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
}

export async function listOrdersByTenant(tenantId: string): Promise<CustomerOrder[]> {
  try {
    const saasOrders = await listSaasOrdersByTenant(tenantId);
    if (saasOrders.length > 0) {
      return saasOrders;
    }

    const db = getAdminDb();
    const snap = await db.collection(toCollectionPath(tenantId)).orderBy("sortIndex", "asc").get();
    if (!snap.empty) {
      return snap.docs.map((doc) => toCustomerOrder(doc.data() as Record<string, unknown>, doc.id));
    }

    return demoOrders.filter((order) => order.tenantId === tenantId);
  } catch {
    return demoOrders.filter((order) => order.tenantId === tenantId);
  }
}

export async function getOrderByTenantAndId(
  tenantId: string,
  orderId: string,
): Promise<CustomerOrder | null> {
  try {
    const sourceSnap = await getAdminDb()
      .collectionGroup(toSaasOrdersCollectionGroupName())
      .where("tenantId", "==", tenantId)
      .get();

    const matched = sourceSnap.docs.find((entry) => entry.id === orderId);
    if (matched) {
      return mapSaasOrderDocToCustomerOrder(matched.id, matched.data() as Record<string, unknown>);
    }

    const allRows = await listSaasOrdersByTenant(tenantId);
    const byBranchMatch = allRows.find((entry) => entry.id === orderId);
    if (byBranchMatch) {
      return byBranchMatch;
    }

    const db = getAdminDb();
    const doc = await db.doc(`${toCollectionPath(tenantId)}/${orderId}`).get();
    if (doc.exists) {
      return toCustomerOrder(doc.data() as Record<string, unknown>, orderId);
    }

    return null;
  } catch {
    return demoOrders.find((order) => order.tenantId === tenantId && order.id === orderId) || null;
  }
}

export async function reseedDemoTenantOrders() {
  const tenantId = DEMO_TENANT_ID;
  try {
    // Always use the canonical 60-order demo seed — never mirror live SaaS data.
    // This ensures hackathon judges see exactly 50 READY (unpaid) + 10 DELIVERED (paid).
    const normalized = DEMO_SEED_ORDERS.map((order) => ({
      id: order.id,
      amount: order.amount,
      tenantId: order.tenantId,
      branch: order.branch,
      service: order.service,
      status: order.status,
      opsStatus: order.opsStatus,
      pickupEta: order.pickupEta,
      branchId: order.branchId,
    }));

    await writeDemoTenantOrders(tenantId, normalized);

    return {
      tenantId,
      count: normalized.length,
      orderIds: normalized.map((order) => order.id),
      mode: "demo-seed" as const,
    };
  } catch {
    return {
      tenantId,
      count: DEMO_SEED_ORDERS.length,
      orderIds: DEMO_SEED_ORDERS.map((order) => order.id),
      mode: "fallback" as const,
    };
  }
}

export async function markOrderPaidByTenantAndId(input: {
  tenantId: string;
  orderId: string;
  paymentId: string;
  txRef?: string;
  network?: "testnet" | "mainnet";
  paidAt?: string;
  paidAmount?: string;
  sourceAccount?: string;
  destinationAccount?: string;
  assetCode?: string;
  assetIssuer?: string;
  ledger?: number;
  explorerUrl?: string;
}): Promise<{ updatedMirror: boolean; updatedSource: boolean }> {
  const {
    tenantId,
    orderId,
    paymentId,
    txRef,
    network,
    paidAt,
    paidAmount,
    sourceAccount,
    destinationAccount,
    assetCode,
    assetIssuer,
    ledger,
    explorerUrl,
  } = input;
  const db = getAdminDb();
  const nowIso = paidAt || new Date().toISOString();

  let updatedMirror = false;
  let updatedSource = false;

  try {
    const mirrorDoc = db.doc(`${toCollectionPath(tenantId)}/${orderId}`);
    const mirrorSnap = await mirrorDoc.get();
    if (mirrorSnap.exists) {
      await mirrorDoc.set(
        {
          status: "paid",
          sourceStatus: "delivered",
          opsStatus: "delivered",
          payment: {
            isVerified: true,
            paymentId,
            txRef: txRef || null,
            network: network || "testnet",
            verifiedAt: nowIso,
            paidAmount: paidAmount || null,
            sourceAccount: sourceAccount || null,
            destinationAccount: destinationAccount || null,
            assetCode: assetCode || null,
            assetIssuer: assetIssuer || null,
            ledger: typeof ledger === "number" ? ledger : null,
            explorerUrl: explorerUrl || null,
          },
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
      updatedMirror = true;
    }
  } catch {
    // Mirror updates are best-effort.
  }

  try {
    const branchesSnap = await db.collection(`tenants/${tenantId}/branches`).get();
    for (const branchDoc of branchesSnap.docs) {
      const orderDoc = db.doc(`tenants/${tenantId}/branches/${branchDoc.id}/orders/${orderId}`);
      const orderSnap = await orderDoc.get();
      if (!orderSnap.exists) continue;

      await orderDoc.set(
        {
          status: "delivered",
          opsStatus: "delivered",
          payment: {
            isVerified: true,
            paymentId,
            txRef: txRef || null,
            network: network || "testnet",
            verifiedAt: nowIso,
            paidAmount: paidAmount || null,
            sourceAccount: sourceAccount || null,
            destinationAccount: destinationAccount || null,
            assetCode: assetCode || null,
            assetIssuer: assetIssuer || null,
            ledger: typeof ledger === "number" ? ledger : null,
            explorerUrl: explorerUrl || null,
          },
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
      updatedSource = true;
      break;
    }
  } catch {
    // Source updates are best-effort.
  }

  return { updatedMirror, updatedSource };
}
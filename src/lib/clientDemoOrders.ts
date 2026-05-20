"use client";

import { collection, getDocs, limit, query } from "firebase/firestore";
import { type CustomerOrder } from "./customerData";
import { db } from "./firebase";
import { toDisplayBranchName } from "./branchDisplay";

function toIsoStringIfTimestampLike(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const seconds = record.seconds;
  if (typeof seconds !== "number") return null;
  const nanoseconds =
    typeof record.nanoseconds === "number"
      ? record.nanoseconds
      : typeof record._nanoseconds === "number"
        ? record._nanoseconds
        : 0;
  const millis = seconds * 1000 + Math.floor(nanoseconds / 1_000_000);
  return new Date(millis).toISOString();
}

function toPickupValue(source: Record<string, unknown>): string {
  const raw = source.pickupEta ?? source.expectedReadyAt ?? source.readyAt ?? source.createdAt;
  if (typeof raw === "string") return raw;
  const iso = toIsoStringIfTimestampLike(raw);
  return iso || "";
}

function mapOrderDoc(id: string, source: Record<string, unknown>): CustomerOrder {
  const items = Array.isArray(source.items) ? source.items : [];
  const firstItem = items.length > 0 && typeof items[0] === "object" ? items[0] : null;
  const firstItemRecord = (firstItem || {}) as Record<string, unknown>;
  const billing =
    source.billing && typeof source.billing === "object"
      ? (source.billing as Record<string, unknown>)
      : null;
  const payment =
    source.payment && typeof source.payment === "object"
      ? (source.payment as Record<string, unknown>)
      : null;

  const opsStatus =
    source.opsStatus === "delivered" || source.opsStatus === "ready"
      ? (source.opsStatus as "ready" | "delivered")
      : typeof source.sourceStatus === "string" &&
          (source.sourceStatus === "delivered" || source.sourceStatus === "ready")
        ? (source.sourceStatus as "ready" | "delivered")
        : typeof source.status === "string" && source.status === "delivered"
          ? "delivered"
          : "ready";

  return {
    id,
    displayOrderId: String(
      source.displayOrderId || source.orderNumber || source.orderNo || source.orderId || id,
    ),
    amount: Number(source.total || source.amount || billing?.totalDue || 0),
    tenantId: String(source.tenantId || "demo-tenant-ph"),
    branch: toDisplayBranchName({
      branchId: typeof source.branchId === "string" ? source.branchId : undefined,
      branchName: String(source.branchName || source.branchId || source.branch || ""),
    }),
    service: String(
      source.serviceName ||
        source.service ||
      firstItemRecord.serviceName ||
        firstItemRecord.serviceId ||
        firstItemRecord.name ||
        "",
    ),
    status: payment?.isVerified === true ? "paid" : "unpaid",
    pickupEta: toPickupValue(source),
    sourceStatus: opsStatus,
    opsStatus,
  };
}

export async function listClientDemoOrders(tenantId: string): Promise<CustomerOrder[]> {
  const branchesSnap = await getDocs(collection(db, `tenants/${tenantId}/branches`));
  if (branchesSnap.empty) return [];

  const rows: CustomerOrder[] = [];

  for (const branchDoc of branchesSnap.docs) {
    const branchId = branchDoc.id;
    const branchData = branchDoc.data() as Record<string, unknown>;
    const branchName = String(branchData.name || branchData.branchName || branchId);

    const ordersSnap = await getDocs(
      query(collection(db, `tenants/${tenantId}/branches/${branchId}/orders`), limit(80)),
    );

    for (const orderDoc of ordersSnap.docs) {
      const mapped = mapOrderDoc(orderDoc.id, orderDoc.data() as Record<string, unknown>);
      rows.push({
        ...mapped,
        tenantId,
        branch: mapped.branch || toDisplayBranchName({ branchId, branchName }),
      });
    }
  }

  if (rows.length === 0) return [];

  return rows.sort((a, b) => a.id.localeCompare(b.id));
}

export async function getClientDemoOrderById(
  tenantId: string,
  orderId: string,
): Promise<CustomerOrder | null> {
  const rows = await listClientDemoOrders(tenantId);
  return rows.find((order) => order.id === orderId) || null;
}
import { DEMO_SEED_ORDERS } from "./demoOrderSeed";

export interface CustomerOrder {
  id: string;
  displayOrderId?: string;
  amount: number;
  tenantId: string;
  branchId?: string;
  branch: string;
  service: string;
  status: "unpaid" | "paid";
  pickupEta: string;
  sourceStatus?: string;
  opsStatus?: "ready" | "delivered";
}

export const demoOrders: CustomerOrder[] = DEMO_SEED_ORDERS.map((order) => ({
  id: order.id,
  amount: order.amount,
  tenantId: order.tenantId,
  branchId: order.branchId,
  branch: order.branch,
  service: order.service,
  status: order.status,
  pickupEta: order.pickupEta,
  opsStatus: order.opsStatus,
}));

export function getOpenOrders(): CustomerOrder[] {
  return demoOrders.filter((order) => order.status === "unpaid");
}

export function getDemoOrderById(orderId: string): CustomerOrder | undefined {
  return demoOrders.find((order) => order.id === orderId);
}

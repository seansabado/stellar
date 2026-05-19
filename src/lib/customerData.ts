export interface CustomerOrder {
  id: string;
  amount: number;
  tenantId: string;
  branch: string;
  service: string;
  status: "unpaid" | "paid";
  pickupEta: string;
}

export const demoOrders: CustomerOrder[] = [
  {
    id: "demo-order-001",
    amount: 12.34,
    tenantId: "demo-tenant",
    branch: "Makati - Paseo",
    service: "Wash + Fold",
    status: "unpaid",
    pickupEta: "Today, 6:30 PM",
  },
  {
    id: "demo-order-002",
    amount: 19.5,
    tenantId: "demo-tenant",
    branch: "Makati - Paseo",
    service: "Dry Clean",
    status: "unpaid",
    pickupEta: "Tomorrow, 10:00 AM",
  },
  {
    id: "demo-order-003",
    amount: 8.75,
    tenantId: "demo-tenant",
    branch: "BGC - High Street",
    service: "Express Wash",
    status: "paid",
    pickupEta: "Ready for pickup",
  },
];

export function getOpenOrders(): CustomerOrder[] {
  return demoOrders.filter((order) => order.status === "unpaid");
}

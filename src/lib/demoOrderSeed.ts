export interface DemoSeedOrder {
  id: string;
  amount: number;
  tenantId: string;
  branchId: string;
  branch: string;
  service: string;
  status: "unpaid" | "paid";
  opsStatus: "ready" | "delivered";
  pickupEta: string;
  currency: "PHP";
  sortIndex: number;
}

export const DEMO_TENANT_ID = "demo-tenant-ph";

const BRANCHES = [
  {
    id: "branch-hq",
    name: "Demo HQ",
  },
  {
    id: "branch-east",
    name: "Demo East Branch",
  },
];

const SERVICES = [
  "Wash + Fold",
  "Dry Clean",
  "Express Wash",
  "Wash + Press",
  "Comforter Clean",
  "Quick Dry",
];

function makePickupEta(index: number, opsStatus: "ready" | "delivered"): string {
  if (opsStatus === "delivered") {
    return "Delivered";
  }
  const times = ["6:30 PM", "8:00 PM", "Tomorrow, 10:00 AM", "Tomorrow, 4:00 PM", "Today, 7:45 PM"];
  const time = times[index % times.length];
  return index % 2 === 0 ? `Today, ${time}` : `Tomorrow, ${time}`;
}

export function generateDemoSeedOrders(): DemoSeedOrder[] {
  return Array.from({ length: 60 }, (_, index) => {
    const orderNumber = index + 1;
    const isPaid = orderNumber > 50;
    const branch = BRANCHES[index % BRANCHES.length];
    const service = SERVICES[index % SERVICES.length];
    const opsStatus = isPaid ? "delivered" : "ready";

    return {
      id: `LPX${String(orderNumber).padStart(4, "0")}`,
      amount: 10.5,
      tenantId: DEMO_TENANT_ID,
      branchId: branch.id,
      branch: branch.name,
      service,
      status: isPaid ? "paid" : "unpaid",
      opsStatus,
      pickupEta: makePickupEta(index, opsStatus),
      currency: "PHP",
      sortIndex: orderNumber,
    };
  });
}

export const DEMO_SEED_ORDERS: DemoSeedOrder[] = generateDemoSeedOrders();
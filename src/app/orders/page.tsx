"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { listClientDemoOrders } from "../../lib/clientDemoOrders";
import { toDisplayBranchName } from "../../lib/branchDisplay";
import { formatPHP } from "../../lib/currency";
import { CUSTOMER_DEMO_TENANT_ID, useCustomerAuth } from "../../lib/customerAuth";
import { type CustomerOrder } from "../../lib/customerData";
import { useAppBase } from "../../lib/useAppBase";

type OpsFilter = "active" | "completed" | "ready" | "all";

function normalizeText(value: string | undefined): string {
  return (value || "").trim().toLowerCase();
}

const READY_STATUS = "ready";
const COMPLETED_STATUS = "delivered";

function getOpsBucket(order: CustomerOrder): OpsFilter {
  const sourceStatus = normalizeText(order.sourceStatus);
  if (sourceStatus === READY_STATUS) {
    return "ready";
  }
  if (sourceStatus === COMPLETED_STATUS) {
    return "completed";
  }
  // SaaS /app Operations logic: Active = not READY and not DELIVERED.
  return "active";
}

function getActionLabel(
  order: CustomerOrder,
): "pay" | "ready-pickup" | "ready-delivery" | null {
  if (order.status !== "paid") return "pay";
  if (normalizeText(order.sourceStatus) !== "ready") return null;
  const svc = normalizeText(order.service);
  if (svc.includes("deliver")) return "ready-delivery";
  return "ready-pickup";
}

function getDisplayOrderId(order: CustomerOrder): string {
  const raw = (order.displayOrderId || order.id || "").trim();
  const compact = raw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (!compact) return "UNKNOWN000";

  let token = compact.length >= 8 ? compact.slice(-8) : compact.padStart(8, "0");
  const hasLetter = /[A-Z]/.test(token);
  const hasDigit = /\d/.test(token);

  if (!hasLetter) token = `A${token.slice(1)}`;
  if (!hasDigit) token = `${token.slice(0, 7)}0`;

  return token;
}

function getDisplayBranch(order: CustomerOrder): string {
  return toDisplayBranchName({
    branchId: order.branchId,
    branchName: order.branch,
  });
}

export default function OrdersPage() {
  const base = useAppBase();
  const router = useRouter();
  const { session } = useCustomerAuth();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<"saas" | "api" | "fallback">("fallback");
  const [searchTerm, setSearchTerm] = useState("");
  const [opsFilter, setOpsFilter] = useState<OpsFilter>("ready");
  const [navigatingOrderId, setNavigatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;

    const loadOrders = async () => {
      setLoadingOrders(true);
      setOrderError(null);
      try {
        const clientRows = await listClientDemoOrders(CUSTOMER_DEMO_TENANT_ID);
        if (clientRows.length > 0) {
          setOrders(clientRows);
          setDataSource("saas");
          return;
        }

        const res = await axios.get("/api/orders", {
          params: {
            tenantId: CUSTOMER_DEMO_TENANT_ID,
          },
        });
        const nextOrders = Array.isArray(res.data?.orders)
          ? (res.data.orders as CustomerOrder[])
          : [];
        if (nextOrders.length > 0) {
          setOrders(nextOrders);
          setDataSource("api");
        } else {
          setOrderError("No live SaaS demo orders found for demo-tenant-ph.");
          setOrders([]);
          setDataSource("fallback");
        }
      } catch {
        setOrderError("Live SaaS demo orders unavailable. Please retry sign-in sync.");
        setOrders([]);
        setDataSource("fallback");
      } finally {
        setLoadingOrders(false);
      }
    };

    void loadOrders();
  }, [session]);

  const filteredOrders = useMemo(() => {
    const query = normalizeText(searchTerm);
    return orders.filter((order) => {
      const bucket = getOpsBucket(order);
      const matchesFilter = opsFilter === "all" ? true : bucket === opsFilter;
      if (!matchesFilter) return false;
      if (!query) return true;
      const haystack = [
        order.id,
        order.branch,
        order.service,
        order.sourceStatus || "",
        order.pickupEta,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [orders, opsFilter, searchTerm]);

  const counts = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        const bucket = getOpsBucket(order);
        acc.all += 1;
        acc[bucket] += 1;
        return acc;
      },
      { active: 0, completed: 0, ready: 0, all: 0 },
    );
  }, [orders]);

  const queueTitle = useMemo(() => {
    if (opsFilter === "completed") return "Completed";
    if (opsFilter === "ready") return "Ready for Pickup";
    if (opsFilter === "all") return "All Orders";
    return "In Progress";
  }, [opsFilter]);

  const goToPay = (id: string) => {
    setNavigatingOrderId(id);
    router.push(`${base}/pay/${id}`);
  };

  return (
    <main className="container">
      <section className="section-head">
        <h1>My Orders</h1>
        <p>Track your laundry orders in real time.</p>
        {dataSource === "saas" ? (
          <p className="subcopy">Updated live from your branch.</p>
        ) : null}
      </section>

      <section className="panel ops-toolbar">
        <label className="ops-search" htmlFor="ops-search">
          <input
            id="ops-search"
            type="search"
            placeholder="Search order"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </label>
        <div className="ops-controls-row">
          <div className="ops-chips" role="tablist" aria-label="Order status filters">
            {([
              ["active", "Active", counts.active],
              ["completed", "Completed", counts.completed],
              ["ready", "Ready", counts.ready],
              ["all", "All", counts.all],
            ] as const).map(([value, label, count]) => (
              <button
                type="button"
                key={value}
                className={opsFilter === value ? "ops-chip ops-chip-active" : "ops-chip"}
                onClick={() => setOpsFilter(value)}
              >
                {label}
                <span>{count}</span>
              </button>
            ))}
          </div>
          <button type="button" className="ops-view-all-btn" onClick={() => setOpsFilter("all")}>
            View All
          </button>
        </div>
      </section>



      {dataSource === "fallback" || loadingOrders || orderError ? (
        <section className="panel fallback-panel">
          <h2>Syncing your orders</h2>
          <p>
            We’re fetching your latest orders. This only takes a moment.
          </p>
          {loadingOrders ? <p>Loading your orders…</p> : null}
          {orderError ? <p className="pay-error">{orderError}</p> : null}
          <Link href={`${base}/orders`} className="btn btn-primary">
            Retry
          </Link>
        </section>
      ) : null}

      <section className="stack-list">
        <p className="subcopy">{queueTitle}</p>
        <section className="panel ops-table-wrap">
          <div className="ops-table-scroll">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Branch</th>
                  <th>Pipeline</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const action = getActionLabel(order);
                  return (
                    <tr key={order.id}>
                      <td className="order-id">#{getDisplayOrderId(order).toUpperCase()}</td>
                      <td className="ops-branch-cell">{getDisplayBranch(order)}</td>
                      <td>
                        <div className="ops-chips-row">
                          {order.sourceStatus && !action ? (
                            <span className="ops-row-chip ops-row-chip-blue">
                              {order.sourceStatus.toUpperCase()}
                            </span>
                          ) : null}
                          {order.service ? (
                            <span className="ops-row-chip ops-row-chip-violet">
                              {order.service.toUpperCase()}
                            </span>
                          ) : null}
                          <span className="ops-row-chip ops-row-chip-cyan">
                            {order.status === "paid" ? "PAID" : "UNPAID"}
                          </span>
                          <span className="ops-row-chip ops-row-chip-emerald">
                            {formatPHP(order.amount)}
                          </span>
                        </div>
                      </td>
                      <td className="ops-action-cell">
                        {action === "pay" ? (
                          <button
                            type="button"
                            className="ops-pay-btn"
                            onClick={() => goToPay(order.id)}
                            onTouchStart={() => goToPay(order.id)}
                            disabled={navigatingOrderId === order.id}
                          >
                            {navigatingOrderId === order.id ? "OPENING..." : "PAY"}
                          </button>
                        ) : action === "ready-pickup" ? (
                          <span className="ops-row-chip ops-row-chip-action-pickup">
                            READY PICKUP
                          </span>
                        ) : action === "ready-delivery" ? (
                          <span className="ops-row-chip ops-row-chip-action-delivery">
                            READY DELIVERY
                          </span>
                        ) : (
                          <span className="ops-action-none">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
        {!loadingOrders && filteredOrders.length === 0 ? (
          <article className="panel empty-panel">
            <h2>No orders found</h2>
            <p>Try a different filter or check back once your order is placed.</p>
          </article>
        ) : null}
      </section>
    </main>
  );
}

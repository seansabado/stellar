"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPHP } from "../lib/currency";
import { useCustomerAuth } from "../lib/customerAuth";
import { getOpenOrders } from "../lib/customerData";
import { getReceipts, type PaymentReceipt } from "../lib/receiptStore";
import { useAppBase } from "../lib/useAppBase";

export default function HomePage() {
  const base = useAppBase();
  const { session } = useCustomerAuth();
  const openOrders = getOpenOrders();
  const [latestReceipt, setLatestReceipt] = useState<PaymentReceipt | null>(null);

  // Refetch receipts when session changes (e.g., after login)
  useEffect(() => {
    const refreshReceipts = () => {
      setLatestReceipt(getReceipts()[0] ?? null);
    };

    // Initial load
    refreshReceipts();

    // Refetch periodically to catch localStorage changes from same tab
    const interval = setInterval(refreshReceipts, 2000);

    // Listen for storage changes (e.g., from another tab)
    const handleStorageChange = () => {
      refreshReceipts();
    };
    window.addEventListener("storage", handleStorageChange);

    // Listen for page visibility - refetch when user returns to tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshReceipts();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [session]);

  const displayName = session?.displayName || session?.email?.split("@")[0] || "there";

  return (
    <main className="container dashboard-container">
      <section className="saas-section-head dashboard-head">
        <h1>Hi, {displayName}</h1>
        <p>Here's a summary of your laundry orders and payments.</p>
      </section>

      <section className="hero-card hero-card-highlight dashboard-hero">
        <div className="hero-layout">
          <div className="hero-copy">
            <p className="eyebrow">Your Laundry, Simplified</p>
            <h2 className="saas-hero-title">Track your laundry and pay with ease.</h2>
            <p className="subcopy">
              View your active orders, make payments, and download receipts — all in one place.
            </p>
            <div className="hero-actions">
              <Link href={`${base}/orders`} className="btn btn-primary">
                {openOrders.length > 0 ? `View Orders (${openOrders.length})` : "View Orders"}
              </Link>
              <Link href={`${base}/history`} className="btn btn-ghost">
                Payment History
              </Link>
            </div>
          </div>

          <div className="hero-kpis">
            <article className="metric-card">
              <span className="metric-label">Active Orders</span>
              <strong className="metric-value">{openOrders.length}</strong>
              <span className="metric-detail">
                {openOrders.length > 0 ? "Ready for your action" : "All orders up to date"}
              </span>
            </article>
            <article className="metric-card">
              <span className="metric-label">Payment Method</span>
              <strong className="metric-value">Secure Online</strong>
              <span className="metric-detail">Pay safely from your device</span>
            </article>
            <article className="metric-card metric-card-accent">
              <span className="metric-label">Last Receipt</span>
              <strong className="metric-value">
                {latestReceipt ? formatPHP(latestReceipt.amount) : "No receipts yet"}
              </strong>
              <span className="metric-detail">
                {latestReceipt
                  ? `Paid on ${new Date(latestReceipt.paidAt).toLocaleDateString()}`
                  : "Your receipts will appear here"}
              </span>
            </article>
          </div>
        </div>
      </section>

      <section className="panel-grid dashboard-panels">
        <article className="panel">
          <h2>Orders</h2>
          {openOrders.length > 0 ? (
            <>
              <p className="kpi">{openOrders.length} pending</p>
              <p>{openOrders.length === 1 ? "1 order is waiting for payment." : `${openOrders.length} orders are waiting for payment.`}</p>
            </>
          ) : (
            <p className="kpi">All caught up</p>
          )}
          <Link href={`${base}/orders`} className="inline-link">
            View your orders
          </Link>
        </article>

        <article className="panel">
          <h2>Pay Next Order</h2>
          {openOrders[0] ? (
            <>
              <p className="kpi">{formatPHP(openOrders[0].amount)}</p>
              <p>{openOrders[0].service}</p>
              <Link href={`${base}/pay/${openOrders[0].id}`} className="inline-link" role="button" tabIndex={0}>
                Pay now
              </Link>
            </>
          ) : (
            <p>No orders due for payment right now.</p>
          )}
        </article>

        <article className="panel">
          <h2>Last Receipt</h2>
          {latestReceipt ? (
            <>
              <p className="kpi">{formatPHP(latestReceipt.amount)}</p>
              <p>Paid on {new Date(latestReceipt.paidAt).toLocaleString()}</p>
              <Link href={`${base}/history`} className="inline-link">
                View all receipts
              </Link>
            </>
          ) : (
            <p>Your receipts will show up here after your first payment.</p>
          )}
        </article>
      </section>
    </main>
  );
}

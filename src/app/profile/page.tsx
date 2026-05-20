"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatPHP } from "../../lib/currency";
import { useCustomerAuth } from "../../lib/customerAuth";
import { useNetwork } from "../../lib/networkContext";
import { getReceipts } from "../../lib/receiptStore";
import {
  fetchStellarTransactions,
  type StellarTransaction,
} from "../../lib/stellarService";
import { useAppBase } from "../../lib/useAppBase";

type TxStatusFilter = "all" | "pending" | "confirmed";
type DatePreset = "custom" | "today" | "7d" | "30d" | "month";

const PROFILE_TX_FILTERS_KEY = "stellarpay.profile.txFilters.v1";
type TxRow = {
  key: string;
  orderId: string;
  amount: number;
  status: "pending" | "confirmed";
  network: "testnet" | "mainnet";
  paidAt: string;
  txRef: string;
};

function toCsvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function toUtcStartOfDay(date: string): string | undefined {
  if (!date) return undefined;
  return `${date}T00:00:00.000Z`;
}

function toUtcEndOfDay(date: string): string | undefined {
  if (!date) return undefined;
  return `${date}T23:59:59.999Z`;
}

function toIsoDate(input: Date): string {
  return input.toISOString().slice(0, 10);
}

function startOfMonthIso(): string {
  const now = new Date();
  return toIsoDate(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)));
}

function daysAgoIso(days: number): string {
  const now = new Date();
  const copy = new Date(now);
  copy.setUTCDate(copy.getUTCDate() - days);
  return toIsoDate(copy);
}

export default function ProfilePage() {
  const base = useAppBase();
  const { session, tenantId } = useCustomerAuth();
  const { network } = useNetwork();
  const [transactions, setTransactions] = useState<StellarTransaction[]>([]);
  const [statusFilter, setStatusFilter] = useState<TxStatusFilter>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [datePreset, setDatePreset] = useState<DatePreset>("custom");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pageSize = 8;

  useEffect(() => {
    const targetTenant = tenantId || "demo-tenant-ph";

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const rows = await fetchStellarTransactions({
          tenantId: targetTenant,
          network,
          status: statusFilter === "all" ? undefined : statusFilter,
          startDate: toUtcStartOfDay(startDate),
          endDate: toUtcEndOfDay(endDate),
          limit: pageSize,
          page,
        });
        setTransactions(rows.transactions);
        setTotal(rows.total);
      } catch {
        setError("Live transaction history is temporarily unavailable.");
        setTransactions([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [tenantId, network, statusFilter, startDate, endDate, page]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(PROFILE_TX_FILTERS_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as {
        statusFilter?: TxStatusFilter;
        startDate?: string;
        endDate?: string;
        datePreset?: DatePreset;
      };

      if (saved.statusFilter === "all" || saved.statusFilter === "pending" || saved.statusFilter === "confirmed") {
        setStatusFilter(saved.statusFilter);
      }

      if (typeof saved.startDate === "string") {
        setStartDate(saved.startDate);
      }

      if (typeof saved.endDate === "string") {
        setEndDate(saved.endDate);
      }

      if (
        saved.datePreset === "custom" ||
        saved.datePreset === "today" ||
        saved.datePreset === "7d" ||
        saved.datePreset === "30d" ||
        saved.datePreset === "month"
      ) {
        setDatePreset(saved.datePreset);
      }
    } catch {
      // Ignore malformed persisted filters.
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      PROFILE_TX_FILTERS_KEY,
      JSON.stringify({
        statusFilter,
        startDate,
        endDate,
        datePreset,
      }),
    );
  }, [statusFilter, startDate, endDate, datePreset]);

  const recentReceipts = useMemo(() => getReceipts().slice(0, 8), []);

  const displayName = session?.displayName || "Demo Customer";
  const displayEmail = session?.email || "customer@demo.laundry";
  const displayTenant = tenantId || "Customer Workspace";

  const receiptRows = useMemo<TxRow[]>(() => {
    const startMs = startDate ? Date.parse(toUtcStartOfDay(startDate) || "") : Number.NEGATIVE_INFINITY;
    const endMs = endDate ? Date.parse(toUtcEndOfDay(endDate) || "") : Number.POSITIVE_INFINITY;

    return recentReceipts
      .filter((row) => {
        if (statusFilter === "pending") return false;
        const paidMs = Date.parse(row.paidAt);
        if (!Number.isFinite(paidMs)) return false;
        if (paidMs < startMs || paidMs > endMs) return false;
        return true;
      })
      .map((row) => ({
        key: `${row.orderId}-${row.paidAt}`,
        orderId: row.orderId,
        amount: row.amount,
        status: "confirmed",
        network: row.network,
        paidAt: row.paidAt,
        txRef: row.txRef || row.paymentId,
      }));
  }, [recentReceipts, startDate, endDate, statusFilter]);

  const transactionRows = useMemo<TxRow[]>(() => {
    return transactions.map((row) => ({
      key: row.paymentId,
      orderId: row.orderId,
      amount: row.amount,
      status: row.status,
      network: row.network,
      paidAt: row.confirmedAt || "",
      txRef: row.txRef || row.paymentId,
    }));
  }, [transactions]);

  const useReceiptFallback = transactionRows.length === 0 && page === 1 && statusFilter !== "pending";
  const shownRows = useReceiptFallback ? receiptRows : transactionRows;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const applyPreset = (preset: Exclude<DatePreset, "custom">) => {
    const today = toIsoDate(new Date());

    if (preset === "today") {
      setStartDate(today);
      setEndDate(today);
    } else if (preset === "7d") {
      setStartDate(daysAgoIso(6));
      setEndDate(today);
    } else if (preset === "30d") {
      setStartDate(daysAgoIso(29));
      setEndDate(today);
    } else {
      setStartDate(startOfMonthIso());
      setEndDate(today);
    }

    setDatePreset(preset);
    setPage(1);
  };

  const clearDateFilters = () => {
    setStartDate("");
    setEndDate("");
    setDatePreset("custom");
    setPage(1);
  };

  const exportCsv = () => {
    if (shownRows.length === 0) return;

    const lines = [
      ["orderId", "amountPhp", "status", "network", "paidAt", "txReference"].join(","),
      ...shownRows.map((row) =>
        [
          toCsvCell(row.orderId),
          toCsvCell(String(row.amount)),
          toCsvCell(row.status),
          toCsvCell(row.network),
          toCsvCell(row.paidAt || "pending"),
          toCsvCell(row.txRef),
        ].join(","),
      ),
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `stellar-transactions-${displayTenant}-p${page}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="container">
      <section className="saas-section-head">
        <h1>Customer Profile</h1>
        <p>Manage your account details, wallet setup, and payment activity.</p>
      </section>

      <section className="panel-grid">
        <article className="panel operational-card">
          <h2>Customer Details</h2>
          <p className="kpi">{displayName}</p>
          <p>Email: {displayEmail}</p>
          <p>Workspace: {displayTenant}</p>
          <p>Network: {network === "mainnet" ? "Stellar Mainnet" : "Stellar Testnet"}</p>
        </article>

        <article className="panel operational-card">
          <h2>Quick Links</h2>
          <p>
            <Link href={`${base}/orders`} className="btn btn-secondary">
              View Orders
            </Link>
          </p>
          <p>
            <Link href={`${base}/history`} className="btn btn-secondary">
              Open Full Payment History
            </Link>
          </p>
          <p>
            <Link href={`${base}/pay/LPX0001`} className="btn btn-primary">
              Start Demo Payment
            </Link>
          </p>
        </article>

        <article className="panel operational-card">
          <h2>Need Help?</h2>
          <p>Chat support: 8:00 AM - 10:00 PM</p>
          <p>WhatsApp: +63 917 123 4567</p>
          <p>Email: support@laundromatai.app</p>
        </article>
      </section>

      <section className="tx-section">
        <div className="tx-section-head">
          <h2>Recent Transactions</h2>
          {loading ? <p className="tx-status">Refreshing...</p> : null}
          {error ? <p className="pay-error">{error}</p> : null}
        </div>

        <div className="tx-filters">
          <div className="ops-chips" role="tablist" aria-label="Quick date presets">
            {([
              ["today", "Today"],
              ["7d", "7D"],
              ["30d", "30D"],
              ["month", "Month"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={datePreset === value ? "ops-chip ops-chip-active" : "ops-chip"}
                onClick={() => applyPreset(value)}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              className={datePreset === "custom" ? "ops-chip ops-chip-active" : "ops-chip"}
              onClick={clearDateFilters}
            >
              All
            </button>
          </div>

          <div className="ops-chips" role="tablist" aria-label="Transaction status filters">
            {([
              ["all", "All"],
              ["confirmed", "Confirmed"],
              ["pending", "Pending"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={statusFilter === value ? "ops-chip ops-chip-active" : "ops-chip"}
                onClick={() => {
                  setStatusFilter(value);
                  setPage(1);
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="tx-date-row">
            <label className="tx-date-field">
              <span>From</span>
              <input
                type="date"
                value={startDate}
                onChange={(event) => {
                  setStartDate(event.target.value);
                  setDatePreset("custom");
                  setPage(1);
                }}
              />
            </label>
            <label className="tx-date-field">
              <span>To</span>
              <input
                type="date"
                value={endDate}
                onChange={(event) => {
                  setEndDate(event.target.value);
                  setDatePreset("custom");
                  setPage(1);
                }}
              />
            </label>
            <button type="button" className="tx-export-btn" onClick={exportCsv} disabled={shownRows.length === 0}>
              Export
            </button>
          </div>
        </div>

        <ul className="tx-list">
          {shownRows.length === 0 ? (
            <li className="tx-empty">No transactions yet.</li>
          ) : (
            shownRows.map((row) => (
              <li key={row.key} className="tx-row">
                <div className="tx-row-main">
                  <p className="tx-row-title">#{row.orderId}</p>
                  <p className="tx-row-sub">
                    {row.paidAt ? new Date(row.paidAt).toLocaleString() : "Pending"} · {row.network}
                  </p>
                </div>
                <div className="tx-row-amount">
                  <strong>{formatPHP(row.amount)}</strong>
                  <span className={row.status === "confirmed" ? "tx-status-pill tx-status-confirmed" : "tx-status-pill tx-status-pending"}>
                    {row.status === "confirmed" ? "Confirmed" : "Pending"}
                  </span>
                </div>
              </li>
            ))
          )}
        </ul>

        <div className="tx-pager">
          <button
            type="button"
            className="tx-pager-btn"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
          >
            Previous
          </button>
          <span className="tx-pager-info">Page {page}{!useReceiptFallback ? ` of ${totalPages}` : ""}</span>
          <button
            type="button"
            className="tx-pager-btn"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={useReceiptFallback || page >= totalPages || total === 0}
          >
            Next
          </button>
        </div>
      </section>
    </main>
  );
}

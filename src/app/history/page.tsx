"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatPHP } from "../../lib/currency";
import { useCustomerAuth } from "../../lib/customerAuth";
import { getReceipts, type PaymentReceipt } from "../../lib/receiptStore";
import { fetchStellarTransactions, type StellarTransaction } from "../../lib/stellarService";
import { useAppBase } from "../../lib/useAppBase";

type HistoryRow = {
  key: string;
  orderId: string;
  amount: number;
  network: "testnet" | "mainnet";
  paidAt?: string;
  txRef?: string;
  paymentId?: string;
  explorerUrl?: string;
  ledger?: number;
  paidAmount?: string;
  assetCode?: string;
  sourceAccount?: string;
  destinationAccount?: string;
};

function isCanonicalDemoRow(orderId: string, amount: number) {
  return /^LPX\d{4}$/i.test(orderId) && amount === 10.5;
}

export default function HistoryPage() {
  const base = useAppBase();
  const { tenantId } = useCustomerAuth();
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [transactions, setTransactions] = useState<StellarTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const targetTenant = tenantId || "demo-tenant-ph";
        const tx = await fetchStellarTransactions({
          tenantId: targetTenant,
          status: "confirmed",
          limit: 100,
          page: 1,
        });
        setTransactions(tx.transactions || []);
      } catch {
        setError("Live payment history is temporarily unavailable.");
        setTransactions([]);
      } finally {
        setReceipts(getReceipts());
        setLoading(false);
      }
    };

    void run();
  }, [tenantId]);

  const useReceiptFallback = transactions.length === 0;

  const rows = useMemo<HistoryRow[]>(() => {
    if (useReceiptFallback) {
      return receipts
        .filter((receipt) => isCanonicalDemoRow(receipt.orderId, receipt.amount))
        .map((receipt) => ({
          key: `${receipt.orderId}-${receipt.paidAt}`,
          orderId: receipt.orderId,
          amount: receipt.amount,
          network: receipt.network,
          paidAt: receipt.paidAt,
          txRef: receipt.txRef,
          paymentId: receipt.paymentId,
          explorerUrl: receipt.explorerUrl,
          ledger: receipt.ledger,
          paidAmount: receipt.paidAmount,
          assetCode: receipt.assetCode,
          sourceAccount: receipt.sourceAccount,
          destinationAccount: receipt.destinationAccount,
        }));
    }

    return transactions.map((tx) => ({
      key: tx.paymentId,
      orderId: tx.orderId,
      amount: tx.amount,
      network: tx.network,
      paidAt: tx.confirmedAt,
      txRef: tx.txRef,
      paymentId: tx.paymentId,
      explorerUrl: tx.explorerUrl,
      ledger: tx.ledger,
      paidAmount: tx.paidAmount,
      assetCode: tx.assetCode,
      sourceAccount: tx.sourceAccount,
      destinationAccount: tx.destinationAccount,
    }));
  }, [receipts, transactions, useReceiptFallback]);

  return (
    <main className="container">
      <section className="saas-section-head">
        <h1>Payment History</h1>
        <p>Digital receipts and payment audit trail for demo-tenant-ph.</p>
        {loading ? <p className="subcopy">Loading live transactions...</p> : null}
        {error ? <p className="pay-error">{error}</p> : null}
      </section>

      {!loading && rows.length === 0 ? (
        <section className="panel empty-panel">
          <h2>No payments yet</h2>
          <p>Make your first payment to generate a receipt.</p>
          <Link href={`${base}/orders`} className="btn btn-primary">
            Go to Orders
          </Link>
        </section>
      ) : (
        <ul className="tx-list">
          {rows.map((row) => {
            const expanded = expandedKey === row.key;
            return (
              <li key={row.key} className="tx-history-item">
                <button
                  type="button"
                  className="tx-history-btn"
                  onClick={() => setExpandedKey((prev) => (prev === row.key ? null : row.key))}
                >
                  <div className="tx-row">
                    <div className="tx-row-main">
                      <p className="tx-row-title">#{row.orderId}</p>
                      <p className="tx-row-sub">
                        {row.paidAt ? new Date(row.paidAt).toLocaleString() : "Pending"} · {row.network}
                      </p>
                    </div>
                    <div className="tx-row-amount">
                      <strong>{formatPHP(row.amount)}</strong>
                      <span className="tx-status-pill tx-status-confirmed">
                        {expanded ? "Hide Details" : "View Details"}
                      </span>
                    </div>
                  </div>
                </button>
                {expanded ? (
                  <div className="tx-history-details">
                    <p>Ledger: {row.ledger ?? "Pending"}</p>
                    <p className="mono">Payment ID: {row.paymentId || "Pending"}</p>
                    <p className="mono">Tx Hash: {row.txRef || "Pending"}</p>
                    <p>
                      On-chain Amount: {row.paidAmount ? `${row.paidAmount} ${row.assetCode || ""}`.trim() : "Pending"}
                    </p>
                    <p className="mono">Source: {row.sourceAccount || "Pending"}</p>
                    <p className="mono">Destination: {row.destinationAccount || "Pending"}</p>
                    {row.explorerUrl ? (
                      <p>
                        <a href={row.explorerUrl} target="_blank" rel="noopener noreferrer">
                          Open transaction in Stellar Expert
                        </a>
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

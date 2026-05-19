import React from "react";
import { Link } from "react-router-dom";
import { formatPHP } from "../lib/currency";
import { getReceipts } from "../lib/receiptStore";

const HistoryPage: React.FC = () => {
  const receipts = getReceipts();

  return (
    <main className="container">
      <section className="section-head">
        <h1>Payment History</h1>
        <p>All your LaundromatAI x Stellar Pay transactions and digital receipts.</p>
      </section>

      {receipts.length === 0 ? (
        <section className="empty-panel">
          <h2>No payments yet</h2>
          <p>Make your first payment to generate a receipt.</p>
          <Link to="/orders" className="btn btn-primary">
            Go to Orders
          </Link>
        </section>
      ) : (
        <section className="stack-list">
          {receipts.map((receipt) => (
            <article className="receipt-card" key={receipt.orderId + receipt.paidAt}>
              <div>
                <p className="order-id">Order #{receipt.orderId}</p>
                <h2>{formatPHP(receipt.amount)} paid</h2>
                <p>{new Date(receipt.paidAt).toLocaleString()}</p>
              </div>
              <div className="receipt-meta">
                <p>Tenant: {receipt.tenantId}</p>
                <p>Network: {receipt.network}</p>
                <p className="mono">Payment: {receipt.paymentId}</p>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
};

export default HistoryPage;

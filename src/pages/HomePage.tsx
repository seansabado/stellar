import React from "react";
import { Link } from "react-router-dom";
import { getOpenOrders } from "../lib/customerData";
import { formatPHP } from "../lib/currency";
import { getReceipts } from "../lib/receiptStore";

const HomePage: React.FC = () => {
  const openOrders = getOpenOrders();
  const latestReceipt = getReceipts()[0];

  return (
    <main className="container">
      <section className="hero-card">
        <p className="eyebrow">LaundromatAI x Stellar Pay</p>
        <h1>Pay your laundry orders in seconds.</h1>
        <p className="subcopy">
          For demo-tenant-ph customers: track orders, scan to pay, and keep digital receipts in one secure app.
        </p>
        <div className="hero-actions">
          <Link to="/orders" className="btn btn-primary">
            View Open Orders ({openOrders.length})
          </Link>
          <Link to="/history" className="btn btn-ghost">
            Payment History
          </Link>
        </div>
      </section>

      <section className="panel-grid">
        <article className="panel">
          <h2>Wallet Status</h2>
          <p className="kpi">Ready for Testnet</p>
          <p>Network: Stellar Testnet</p>
          <p>Display Currency: PHP</p>
        </article>

        <article className="panel">
          <h2>Next Step</h2>
          {openOrders[0] ? (
            <>
              <p className="kpi">Order #{openOrders[0].id}</p>
              <p>{openOrders[0].service}</p>
              <p>Amount: {formatPHP(openOrders[0].amount)}</p>
              <Link to={`/pay/${openOrders[0].id}`} className="inline-link">
                Pay this order
              </Link>
            </>
          ) : (
            <p>All caught up. No open orders to pay.</p>
          )}
        </article>

        <article className="panel">
          <h2>Latest Receipt</h2>
          {latestReceipt ? (
            <>
              <p className="kpi">#{latestReceipt.orderId}</p>
              <p>{formatPHP(latestReceipt.amount)} paid</p>
              <p>{new Date(latestReceipt.paidAt).toLocaleString()}</p>
              <Link to="/history" className="inline-link">
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
};

export default HomePage;

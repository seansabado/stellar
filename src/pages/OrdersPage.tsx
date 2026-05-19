import React from "react";
import { Link } from "react-router-dom";
import { formatPHP } from "../lib/currency";
import { demoOrders } from "../lib/customerData";

const OrdersPage: React.FC = () => {
  return (
    <main className="container">
      <section className="section-head">
        <h1>Your Laundry Orders</h1>
        <p>Pay open orders in PHP and monitor pickup status for demo-tenant-ph.</p>
      </section>

      <section className="stack-list">
        {demoOrders.map((order) => (
          <article className="order-card" key={order.id}>
            <div>
              <p className="order-id">Order #{order.id}</p>
              <h2>{order.service}</h2>
              <p>{order.branch}</p>
              <p>Pickup: {order.pickupEta}</p>
            </div>
            <div className="order-side">
              <p className="order-amount">{formatPHP(order.amount)}</p>
              <span
                className={
                  order.status === "paid" ? "pill pill-paid" : "pill pill-unpaid"
                }
              >
                {order.status.toUpperCase()}
              </span>
              {order.status === "unpaid" && (
                <Link to={`/pay/${order.id}`} className="btn btn-primary">
                  Pay Now
                </Link>
              )}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
};

export default OrdersPage;

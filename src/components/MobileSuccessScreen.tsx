import React from "react";
import { Link } from "react-router-dom";

const MobileSuccessScreen: React.FC<{ orderId: string }> = ({ orderId }) => (
  <div className="success-shell">
    <svg
      className="success-icon"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
    <h2>Payment Confirmed</h2>
    <p>Order #{orderId} is now paid and recorded in your receipt history.</p>
    <div className="success-actions">
      <Link to="/history" className="btn btn-primary">
        View Receipt
      </Link>
      <Link to="/orders" className="btn btn-ghost">
        Back to Orders
      </Link>
    </div>
  </div>
);

export default MobileSuccessScreen;

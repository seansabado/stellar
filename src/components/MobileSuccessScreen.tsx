import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppBase } from "../lib/useAppBase";

const MobileSuccessScreen: React.FC<{ orderId: string }> = ({ orderId }) => {
  const base = useAppBase();
  const router = useRouter();

  const handleBackToOrders = () => {
    // Invalidate the Next.js router cache so the orders page re-fetches fresh data
    router.refresh();
    router.push(`${base}/orders`);
  };

  return (
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
      <p>Order #{orderId} is now paid and logged in your operations history.</p>
      <div className="success-actions">
        <Link href={`${base}/history`} className="btn btn-primary">
          View Receipt
        </Link>
        <button type="button" className="btn btn-ghost" onClick={handleBackToOrders}>
          Back to Orders
        </button>
      </div>
    </div>
  );
};

export default MobileSuccessScreen;

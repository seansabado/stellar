import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StellarQR from "../../components/StellarQR";
import MobileSuccessScreen from "../../components/MobileSuccessScreen";
import AddToHomeScreenBanner from "../../components/AddToHomeScreenBanner";
import { saveReceipt } from "../../lib/receiptStore";
import axios from "axios";

interface Order {
  id: string;
  amount: number;
  tenantId: string;
  status: string;
}

const PayOrderPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);
  const [network, setNetwork] = useState<"testnet" | "mainnet">("testnet");
  const [status, setStatus] = useState<"pending" | "confirmed">("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`/api/order/${orderId}`);
        setOrder(res.data);
      } catch {
        setError("Unable to load order. Please try again.");
      }
    };
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (!order) return;
    const createPayment = async () => {
      try {
        const res = await axios.post("/api/create-stellar-payment", {
          orderId: order.id,
          amount: order.amount,
          tenantId: order.tenantId,
        });
        setPaymentId(res.data.paymentId);
        setQrData(res.data.qrData);
        setNetwork(res.data.network);
      } catch {
        setError("Unable to generate payment QR right now.");
      }
    };
    createPayment();
  }, [order]);

  useEffect(() => {
    if (!paymentId) return;
    setLoading(false);
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(
          `/api/check-stellar-payment?paymentId=${paymentId}`,
        );
        setStatus(res.data.status);
        if (res.data.status === "confirmed") {
          clearInterval(interval);
          saveReceipt({
            orderId: order?.id || orderId || "unknown-order",
            amount: order?.amount || 0,
            tenantId: order?.tenantId || "unknown-tenant",
            network,
            paymentId,
            paidAt: new Date().toISOString(),
          });
        }
      } catch {
        setError("Payment check interrupted. Retrying...");
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [paymentId, network, order, orderId]);

  if (loading || !order)
    return (
      <div className="pay-shell pay-loading">
        <h2>Preparing your secure checkout...</h2>
        <p>Please wait while we fetch your order details.</p>
      </div>
    );
  if (status === "confirmed") return <MobileSuccessScreen orderId={order.id} />;

  return (
    <div className="pay-shell">
      <section className="pay-card">
        <p className="eyebrow">Secure Checkout</p>
        <h1>Pay with Stellar USDC</h1>
        <p className="pay-meta">
          Order #{order.id} · ${order.amount.toFixed(2)}
        </p>
        {error && <p className="pay-error">{error}</p>}
        {qrData ? (
          <StellarQR qrData={qrData} network={network} />
        ) : (
          <p>Generating payment QR...</p>
        )}
        <p className="status-chip">
          Payment status: {status === "pending" ? "Awaiting payment" : "Paid"}
        </p>
      </section>
      <AddToHomeScreenBanner />
    </div>
  );
};

export default PayOrderPage;

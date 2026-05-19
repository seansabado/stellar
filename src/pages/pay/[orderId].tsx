import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StellarQR from "../../components/StellarQR";
import MobileSuccessScreen from "../../components/MobileSuccessScreen";
import AddToHomeScreenBanner from "../../components/AddToHomeScreenBanner";
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

  useEffect(() => {
    const fetchOrder = async () => {
      // TODO: Replace with real LaundromatAI API call
      const res = await axios.get(`/api/order/${orderId}`);
      setOrder(res.data);
    };
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (!order) return;
    const createPayment = async () => {
      const res = await axios.post("/api/create-stellar-payment", {
        orderId: order.id,
        amount: order.amount,
        tenantId: order.tenantId,
      });
      setPaymentId(res.data.paymentId);
      setQrData(res.data.qrData);
      setNetwork(res.data.network);
    };
    createPayment();
  }, [order]);

  useEffect(() => {
    if (!paymentId) return;
    setLoading(false);
    const interval = setInterval(async () => {
      const res = await axios.get(
        `/api/check-stellar-payment?paymentId=${paymentId}`,
      );
      setStatus(res.data.status);
      if (res.data.status === "confirmed") clearInterval(interval);
    }, 3000);
    return () => clearInterval(interval);
  }, [paymentId]);

  if (loading || !order)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  if (status === "confirmed") return <MobileSuccessScreen orderId={order.id} />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-2">Pay with Stellar USDC</h1>
      <p className="mb-4">
        Order #{order.id} — Amount: ${order.amount}
      </p>
      {qrData && <StellarQR qrData={qrData} network={network} />}
      <AddToHomeScreenBanner />
    </div>
  );
};

export default PayOrderPage;

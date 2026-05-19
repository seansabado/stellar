import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import PayOrderPage from "./pages/pay/[orderId]";

const Home: React.FC = () => {
  return (
    <main className="page">
      <h1>StellarPay MVP</h1>
      <p>Open the payment route with an order ID to test.</p>
      <code>/pay/demo-order-001</code>
    </main>
  );
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/pay/:orderId" element={<PayOrderPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;

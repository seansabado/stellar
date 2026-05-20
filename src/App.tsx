import React from "react";
import { NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import OrdersPage from "./pages/OrdersPage";
import HistoryPage from "./pages/HistoryPage";
import ProfilePage from "./pages/ProfilePage";
import PayOrderPage from "./pages/pay/[orderId]";

const navItems = [
  { to: "", label: "Home" },
  { to: "/orders", label: "Orders" },
  { to: "/history", label: "History" },
  { to: "/profile", label: "Profile" },
];

const App: React.FC = () => {
  const { pathname } = useLocation();
  const base = pathname.startsWith("/stelllar") ? "/stelllar" : "";

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">LaundromatAI x Stellar Pay</div>
        <p className="tagline">Customer Payments</p>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/pay/:orderId" element={<PayOrderPage />} />

        <Route path="/stelllar" element={<HomePage />} />
        <Route path="/stelllar/orders" element={<OrdersPage />} />
        <Route path="/stelllar/history" element={<HistoryPage />} />
        <Route path="/stelllar/profile" element={<ProfilePage />} />
        <Route path="/stelllar/pay/:orderId" element={<PayOrderPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <nav className="bottom-nav" aria-label="Primary">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={`${base}${item.to}` || "/"}
            className={({ isActive }) =>
              isActive ? "nav-item nav-item-active" : "nav-item"
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default App;

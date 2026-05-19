import React from "react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import OrdersPage from "./pages/OrdersPage";
import HistoryPage from "./pages/HistoryPage";
import ProfilePage from "./pages/ProfilePage";
import PayOrderPage from "./pages/pay/[orderId]";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/orders", label: "Orders" },
  { to: "/history", label: "History" },
  { to: "/profile", label: "Profile" },
];

const App: React.FC = () => {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">StellarPay</div>
        <p className="tagline">Customer App</p>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/pay/:orderId" element={<PayOrderPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <nav className="bottom-nav" aria-label="Primary">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
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

import React from "react";

const ProfilePage: React.FC = () => {
  return (
    <main className="container">
      <section className="section-head">
        <h1>Customer Profile</h1>
        <p>Manage your LaundromatAI x Stellar Pay account and payment help.</p>
      </section>

      <section className="panel-grid">
        <article className="panel">
          <h2>Account</h2>
          <p className="kpi">Demo Customer</p>
          <p>Email: customer@demo.laundry</p>
          <p>Phone: +63 917 000 0000</p>
        </article>

        <article className="panel">
          <h2>Payment Preferences</h2>
          <p>Default method: Stellar USDC (PHP display)</p>
          <p>Network: Testnet</p>
          <p>Auto-open wallet: Enabled</p>
        </article>

        <article className="panel">
          <h2>Need Help?</h2>
          <p>Chat support: 8:00 AM - 10:00 PM</p>
          <p>WhatsApp: +63 917 123 4567</p>
          <p>Email: support@laundromatai.app</p>
        </article>
      </section>
    </main>
  );
};

export default ProfilePage;

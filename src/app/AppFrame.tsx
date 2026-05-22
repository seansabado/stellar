"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useCustomerAuth } from "../lib/customerAuth";
import { useNetwork } from "../lib/networkContext";

const navItems = [
  {
    to: "",
    label: "Dashboard",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: "/orders",
    label: "Orders",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    to: "/profile",
    label: "Profile",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

type AppFrameProps = {
  children: React.ReactNode;
};

export default function AppFrame({ children }: AppFrameProps) {
  const pathname = usePathname();
  const safePathname = pathname ?? "/";
  const base = safePathname.startsWith("/stelllar") ? "/stelllar" : "";
  const { session, signOutCustomer, loading } = useCustomerAuth();
  const { network, setNetwork } = useNetwork();
  const normalizedPath =
    safePathname.startsWith("/stelllar")
      ? safePathname.replace("/stelllar", "") || "/"
      : safePathname;

  return (
    <div className="saas-shell">
      <header className="saas-topbar">
        <div className="saas-topbar-inner">
          {/* Brand — left side */}
          <div className="saas-brand-block">
            <div className="saas-brand-mark">
              <div className="saas-online-dot" aria-hidden="true" />
              L
            </div>
            <div className="saas-brand">LaundromatAI x StellarPay</div>
          </div>

          {/* Desktop nav — hidden on mobile */}
          <nav className="saas-nav" aria-label="Primary">
            {navItems.map((item) => {
              const href = `${base}${item.to}` || "/";
              const routePath = item.to || "/";
              const active = normalizedPath === routePath;
              return (
                <Link
                  key={item.label}
                  href={href}
                  className={active ? "saas-nav-item saas-nav-item-active" : "saas-nav-item"}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side actions */}
          <div className="saas-topbar-right">
            <button
              type="button"
              className={`net-chip ${network === "mainnet" ? "net-chip-live" : ""}`}
              onClick={() => setNetwork(network === "testnet" ? "mainnet" : "testnet")}
              title={network === "mainnet" ? "Mainnet – payments are LIVE. Tap to switch." : "Testnet mode. Tap to switch."}
            >
              {network === "testnet" ? "TESTNET" : "MAINNET"}
            </button>
            {!session && loading ? <div className="saas-chip saas-chip-xs">…</div> : null}
          </div>
        </div>
      </header>

      <div className="saas-page-shell">{children}</div>

      <nav className="saas-bottom-nav" aria-label="Mobile primary">
        {navItems.map((item) => {
          const href = `${base}${item.to}` || "/";
          const routePath = item.to || "/";
          const active = normalizedPath === routePath;
          return (
            <Link
              key={item.label}
              href={href}
              className={active ? "saas-bottom-item saas-bottom-item-active" : "saas-bottom-item"}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
        {session ? (
          <button
            type="button"
            className="saas-bottom-item saas-bottom-action"
            onClick={() => void signOutCustomer()}
            aria-label="Sign out"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        ) : null}
      </nav>
    </div>
  );
}

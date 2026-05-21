"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

type StellarNetwork = "testnet" | "mainnet";

type NetworkContextType = {
  network: StellarNetwork;
  setNetwork: (network: StellarNetwork) => void;
};

const STORAGE_KEY = "stellar_network_preference";

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [network, setNetworkState] = useState<StellarNetwork>("testnet");

  // Hydrate from localStorage once on mount (client only)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "mainnet" || saved === "testnet") {
        setNetworkState(saved);
      }
    } catch {
      // localStorage unavailable (SSR / private browsing) — keep default
    }
  }, []);

  const setNetwork = useCallback((next: StellarNetwork) => {
    setNetworkState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  return (
    <NetworkContext.Provider value={{ network, setNetwork }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error("useNetwork must be used within NetworkProvider");
  }
  return context;
}

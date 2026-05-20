"use client";

import React, { createContext, useContext, useState } from "react";

type StellarNetwork = "testnet" | "mainnet";

type NetworkContextType = {
  network: StellarNetwork;
  setNetwork: (network: StellarNetwork) => void;
};

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [network, setNetwork] = useState<StellarNetwork>("testnet");

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

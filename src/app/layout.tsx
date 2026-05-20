import type { Metadata } from "next";
import "./layout.css";
import CustomerAuthGate from "../components/CustomerAuthGate";
import { CustomerAuthProvider } from "../lib/customerAuth";
import { NetworkProvider } from "../lib/networkContext";
import AppFrame from "./AppFrame";
import ServiceWorkerRegistrar from "../components/ServiceWorkerRegistrar";

export const metadata: Metadata = {
  title: "StellarPay MVP",
  description: "LaundromatAI x StellarPay customer payment app",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: ["/icon.svg", "/favicon.ico"],
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="stellar-theme" suppressHydrationWarning>
        <ServiceWorkerRegistrar />
        <CustomerAuthProvider>
          <NetworkProvider>
            <AppFrame>
              <CustomerAuthGate>{children}</CustomerAuthGate>
            </AppFrame>
          </NetworkProvider>
        </CustomerAuthProvider>
      </body>
    </html>
  );
}

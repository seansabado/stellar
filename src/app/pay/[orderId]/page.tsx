"use client";

import axios from "axios";
import type { AxiosError } from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import AddToHomeScreenBanner from "../../../components/AddToHomeScreenBanner";
import MobileSuccessScreen from "../../../components/MobileSuccessScreen";
import QRScanner from "../../../components/QRScanner";
import { getClientDemoOrderById } from "../../../lib/clientDemoOrders";
import { formatPHP } from "../../../lib/currency";
import { useCustomerAuth } from "../../../lib/customerAuth";
import { useNetwork } from "../../../lib/networkContext";
import { saveReceipt } from "../../../lib/receiptStore";
import { useAppBase } from "../../../lib/useAppBase";

interface Order {
  id: string;
  amount: number;
  tenantId: string;
  branch?: string;
  status: string;
}

interface PaymentTimelineItem {
  status: "pending" | "confirmed";
  at: string;
}

interface PaymentProof {
  status: "pending" | "confirmed";
  orderId: string;
  tenantId: string;
  paymentId: string;
  txRef?: string;
  confirmedAt?: string;
  explorerUrl?: string;
  ledger?: number;
  paidAmount?: string;
  assetCode?: string;
  assetIssuer?: string;
  sourceAccount?: string;
  destinationAccount?: string;
  verificationReason?:
    | "awaiting_chain"
    | "tx_not_found"
    | "operation_mismatch"
    | "horizon_unavailable"
    | "invalid_config"
    | "expired_intent"
    | "confirmed";
  expiresAt?: string;
  timeline: PaymentTimelineItem[];
}

const DEMO_TENANT_ID = "demo-tenant-ph";
// Legacy printed counter QR (kept for backward compat with physical signage)
const MERCHANT_DESTINATION_ACCOUNT_LEGACY = "GA7TCBDZ4JRJ7N6NFC47Z6OEUVJ5PO3NFHXARPL6B22CXD5FTMRJCDFJ";
// Network-specific destination accounts — must match apphosting.yaml env vars
const MERCHANT_DESTINATION_TESTNET = "GBK4EPWBVRS5KLW6AR2QTPFD5ZUJIVCP3KTEY2CIF6QOCAYY4SDZO6WC";
const MERCHANT_DESTINATION_MAINNET = "GBKCJC3Y7AWEYLDJ2ZB72JG54IZ3FE262FQAGZXXVKNVQ5PX64NTWF4C";
const MAX_LEDGER_WAIT_SECONDS = 90;

export default function PayOrderPage() {
  const base = useAppBase();
  const params = useParams<{ orderId: string }>();
  const orderId = params?.orderId;
  const { session, tenantId } = useCustomerAuth();
  const { network } = useNetwork();
  // Derived network-specific merchant destination (for QR validation)
  const MERCHANT_DESTINATION_ACCOUNT = network === "mainnet" ? MERCHANT_DESTINATION_MAINNET : MERCHANT_DESTINATION_TESTNET;
  const MERCHANT_STELLAR_URI = `stellar:${MERCHANT_DESTINATION_ACCOUNT}`;
  const [order, setOrder] = useState<Order | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);
  const [paymentNetwork, setPaymentNetwork] = useState<"testnet" | "mainnet">("testnet");
  const [status, setStatus] = useState<"pending" | "confirmed">("pending");
  const [proof, setProof] = useState<PaymentProof | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingIntent, setRefreshingIntent] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [cameraVerified, setCameraVerified] = useState(false);
  const [cameraMessage, setCameraMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentStarted, setPaymentStarted] = useState(false);
  const receiptSavedRef = useRef(false);
  const submitStartedAtRef = useRef<number | null>(null);
  const [submitSeconds, setSubmitSeconds] = useState(0);
  const [ledgerTimedOut, setLedgerTimedOut] = useState(false);

  // Track elapsed seconds while waiting for ledger confirmation
  useEffect(() => {
    if (!paymentStarted || proof?.txRef || ledgerTimedOut) {
      setSubmitSeconds(0);
      return;
    }
    const t = setInterval(() => {
      const startedAt = submitStartedAtRef.current;
      if (!startedAt) return;
      setSubmitSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [ledgerTimedOut, paymentStarted, proof?.txRef]);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      setError("Customer sign-in is required before payment can start.");
      return;
    }

    const fetchOrder = async () => {
      try {
        const resolvedOrderId = orderId || "LPX0001";
        const res = await axios.get(`/api/order/${resolvedOrderId}`);
        if (res.data?.tenantId !== DEMO_TENANT_ID) {
          const clientFallback = await getClientDemoOrderById(
            DEMO_TENANT_ID,
            resolvedOrderId,
          );
          if (clientFallback) {
            setOrder({
              id: clientFallback.id,
              amount: clientFallback.amount,
              tenantId: clientFallback.tenantId,
              branch: clientFallback.branch,
              status: clientFallback.status,
            });
            setError("Loaded order from live SaaS demo tenant source.");
            return;
          }

          setError("Order not found in live demo-tenant-ph source.");
          setLoading(false);
          return;
        }
        setOrder(res.data);
      } catch {
        const clientFallback = await getClientDemoOrderById(
          DEMO_TENANT_ID,
          orderId || "LPX0001",
        );
        if (clientFallback) {
          setOrder({
            id: clientFallback.id,
            amount: clientFallback.amount,
            tenantId: clientFallback.tenantId,
            branch: clientFallback.branch,
            status: clientFallback.status,
          });
          setError("Live API unavailable. Loaded order from live SaaS source.");
          return;
        }

        setError("Unable to load order from demo-tenant-ph live source. Please retry sync.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, session]);

  const createPaymentIntent = useCallback(async () => {
    if (!order || !session || !cameraVerified) {
      if (!cameraVerified) {
        setError("Verify the printed merchant QR first before generating the pay QR.");
      }
      return;
    }
    try {
      setRefreshingIntent(true);
      setError(null);
      setLedgerTimedOut(false);
      setSubmitSeconds(0);
      submitStartedAtRef.current = null;
      receiptSavedRef.current = false;
      setStatus("pending");
      setPaymentStarted(true);
      setProof(null);
      setPaymentId(null);
      setQrData(null);
      const res = await axios.post("/api/create-stellar-payment", {
        orderId: order.id,
        amount: order.amount,
        tenantId: order.tenantId,
        network,
      });
      setPaymentId(res.data.paymentId);
      setQrData(res.data.qrData);
      setPaymentNetwork(res.data.network);
      submitStartedAtRef.current = Date.now();
      if (res.data.snapshot) {
        setProof({
          status: res.data.snapshot.status,
          orderId: res.data.snapshot.orderId,
          tenantId: res.data.snapshot.tenantId,
          paymentId: res.data.snapshot.paymentId,
          txRef: res.data.snapshot.txRef,
          confirmedAt: res.data.snapshot.confirmedAt,
          explorerUrl: res.data.snapshot.explorerUrl,
          ledger: res.data.snapshot.ledger,
          paidAmount: res.data.snapshot.paidAmount,
          assetCode: res.data.snapshot.assetCode,
          assetIssuer: res.data.snapshot.assetIssuer,
          sourceAccount: res.data.snapshot.sourceAccount,
          destinationAccount: res.data.snapshot.destinationAccount,
          verificationReason: res.data.snapshot.verificationReason,
          expiresAt: res.data.snapshot.expiresAt,
          timeline: res.data.snapshot.timeline || [],
        });
      }
    } catch (caughtError) {
      const responseError = caughtError as AxiosError<{ error?: string; status?: string }>;
      const apiMessage = responseError.response?.data?.error;
      setPaymentStarted(false);
      submitStartedAtRef.current = null;
      if (responseError.response?.status === 409 && apiMessage) {
        setError(apiMessage);
      } else {
        setError(apiMessage || "Unable to generate payment QR right now.");
      }
    } finally {
      setRefreshingIntent(false);
    }
  }, [cameraVerified, network, order, session]);

  const handleCameraScan = useCallback((data: string) => {
    const normalized = data.trim();
    const target = normalized.replace(/^stellar:/i, "").replace(/^pay\?/, "");
    const decoded = target.includes("%") ? decodeURIComponent(target) : target;

    const activeDestination =
      network === "mainnet" ? MERCHANT_DESTINATION_MAINNET : MERCHANT_DESTINATION_TESTNET;

    const matchesDestination =
      normalized.includes(activeDestination) ||
      decoded.includes(activeDestination) ||
      normalized.includes(MERCHANT_DESTINATION_ACCOUNT_LEGACY) ||
      decoded.includes(MERCHANT_DESTINATION_ACCOUNT_LEGACY);

    if (matchesDestination) {
      setCameraVerified(true);
      setCameraMessage(`Merchant QR verified (${network}). PAY NOW is unlocked.`);
      setError(null);
      return;
    }

    setCameraVerified(false);
    setCameraMessage(`QR does not match the ${network} merchant destination.`);
  }, [network]);

  useEffect(() => {
    if (!paymentId || !order || ledgerTimedOut || !paymentStarted) return;

    // Strict Stellar confirmation: poll Horizon every 3s and confirm only on-chain proof
    let cancelled = false;

    const runCheck = async () => {
      if (cancelled) return;

      const startedAt = submitStartedAtRef.current;
      if (startedAt && Math.floor((Date.now() - startedAt) / 1000) >= MAX_LEDGER_WAIT_SECONDS) {
        setLedgerTimedOut(true);
        setError("Ledger confirmation is taking longer than expected. Tap Retry Check to continue.");
        return;
      }

      try {
        const res = await axios.get(
          `/api/check-stellar-payment?paymentId=${paymentId}&network=${paymentNetwork}`,
        );
        setProof({
          status: res.data.status,
          orderId: res.data.orderId ?? order.id,
          tenantId: res.data.tenantId ?? order.tenantId,
          paymentId: res.data.paymentId ?? paymentId,
          txRef: res.data.txRef,
          confirmedAt: res.data.confirmedAt,
          explorerUrl: res.data.explorerUrl,
          ledger: res.data.ledger,
          paidAmount: res.data.paidAmount,
          assetCode: res.data.assetCode,
          assetIssuer: res.data.assetIssuer,
          sourceAccount: res.data.sourceAccount,
          destinationAccount: res.data.destinationAccount,
          verificationReason: res.data.verificationReason,
          expiresAt: res.data.expiresAt,
          timeline: res.data.timeline ?? [],
        });

        if (res.data.status === "pending" && res.data.verificationReason === "expired_intent") {
          setPaymentStarted(false);
          setLedgerTimedOut(true);
          setError("Payment intent expired. Tap PAY NOW again to create a fresh intent.");
          return;
        }

        if (res.data.status === "confirmed" && !receiptSavedRef.current) {
          receiptSavedRef.current = true;
          setPaymentStarted(false);
          setLedgerTimedOut(false);
          setStatus("confirmed");
          saveReceipt({
            orderId: order.id,
            amount: order.amount,
            tenantId: order.tenantId,
            network: paymentNetwork,
            paymentId,
            txRef: res.data.txRef,
            paidAt: res.data.confirmedAt ?? new Date().toISOString(),
            explorerUrl: res.data.explorerUrl,
            ledger: res.data.ledger,
            paidAmount: res.data.paidAmount,
            assetCode: res.data.assetCode,
            assetIssuer: res.data.assetIssuer,
            sourceAccount: res.data.sourceAccount,
            destinationAccount: res.data.destinationAccount,
          });
        }
      } catch {
        // Silently retry
      }
    };

    void runCheck();
    const interval = setInterval(() => {
      void runCheck();
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [ledgerTimedOut, order, paymentId, paymentNetwork, paymentStarted]);

  const retryLedgerCheck = useCallback(() => {
    setError(null);
    setLedgerTimedOut(false);
    setSubmitSeconds(0);
    // Re-fire the full intent so a fresh Friendbot tx is submitted
    void createPaymentIntent();
  }, [createPaymentIntent]);

  useEffect(() => {
    if (!proof?.expiresAt) {
      setSecondsLeft(null);
      return;
    }

    const tick = () => {
      const left = Math.max(0, Math.floor((Date.parse(proof.expiresAt || "") - Date.now()) / 1000));
      setSecondsLeft(left);
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [proof?.expiresAt]);

  if (loading || !order) {
    if (!loading && !order) {
      return (
        <div className="pay-shell pay-loading">
          <h2>We could not load your order</h2>
          <p>{error || "This order could not be found right now."}</p>
          <div className="hero-actions">
            <Link href={`${base}/orders`} className="btn btn-primary">
              Go to Orders
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="pay-shell pay-loading">
        <h2>Preparing your checkout...</h2>
        <p>Please wait while we load your order details.</p>
      </div>
    );
  }

  if (status === "confirmed") return <MobileSuccessScreen orderId={order.id} />;

  const branchLabel = order.branch || "Demo Branch";

  return (
    <div className="pay-shell">
      <section className="pay-card pay-card-saas">
        <section className="saas-section-head">
          <h1>Pay Your Order</h1>
          <p>Secure checkout powered by StellarPay.</p>
        </section>

        <div className="payment-amount-block">
          <strong className="payment-amount-value">{formatPHP(order.amount)}</strong>
          <div className="payment-amount-meta-group">
            <span className="metric-label" style={{ marginBottom: 0 }}>Amount Due</span>
            <p className="payment-amount-meta">Order #{order.id}</p>
            <p className="payment-amount-meta">Branch: {branchLabel}</p>
          </div>
        </div>

        {/* Fee Breakdown — shows Stellar cost advantage vs GCash/Maya */}
        <div className="fee-breakdown">
          <p className="fee-breakdown-title">Fee Breakdown</p>
          <div className="fee-breakdown-row">
            <span>Order total</span>
            <span className="fee-breakdown-amount">{formatPHP(order.amount)}</span>
          </div>
          <div className="fee-breakdown-row">
            <span>Stellar network fee</span>
            <span className="fee-breakdown-amount fee-breakdown-zero">100 stroops · 0.000001 XLM · &lt;₱0.01</span>
          </div>
          <div className="fee-breakdown-row">
            <span>Platform fee <span className="fee-breakdown-rate">(0.5%)</span></span>
            <span className="fee-breakdown-amount fee-breakdown-zero">
              {formatPHP(order.amount * 0.005)}{" "}
              <span className="fee-breakdown-waived">demo: waived</span>
            </span>
          </div>
          <div className="fee-breakdown-divider" />
          <div className="fee-breakdown-row fee-breakdown-total-row">
            <span>Total charged</span>
            <span>{formatPHP(order.amount)}</span>
          </div>
          <p className="fee-breakdown-compare">
            GCash/Maya 1.5% = {formatPHP(order.amount * 0.015)} for same order
          </p>
        </div>

        {error ? <p className="pay-error pay-error-inline">{error}</p> : null}

        <div className="checkout-grid">
          <div className="checkout-qr-card">
            {!cameraVerified ? (
              <>
                <QRScanner
                  title="Step 1 of 2"
                  description="Open your camera and scan the printed store QR at the counter."
                  onScan={handleCameraScan}
                  onValidate={(data) => {
                    const normalized = data.trim();
                    const target = normalized.replace(/^stellar:/i, "").replace(/^pay\?/, "");
                    const decoded = target.includes("%") ? decodeURIComponent(target) : target;
                    return (
                      normalized.includes(MERCHANT_DESTINATION_ACCOUNT) ||
                      decoded.includes(MERCHANT_DESTINATION_ACCOUNT) ||
                      normalized.includes(MERCHANT_STELLAR_URI)
                    );
                  }}
                  onError={(message) => setCameraMessage(message)}
                  allowManualConfirm
                  manualConfirmValue={MERCHANT_DESTINATION_ACCOUNT}
                  manualConfirmLabel="Verify QR"
                />
                {cameraMessage ? (
                  <div className="panel">
                    <p className="pay-error" style={{ margin: 0 }}>{cameraMessage}</p>
                    <p className="subcopy" style={{ marginTop: 8 }}>
                      If your browser blocks camera scanning, tap <strong>Verify QR</strong> after scanning the printed store QR.
                    </p>
                  </div>
                ) : null}
              </>
            ) : !paymentStarted ? (
              <div className="panel qr-scan-verified">
                <p className="eyebrow">Step 2 of 2</p>
                <h2>Ready to Pay</h2>
                <p className="subcopy" style={{ marginBottom: 12 }}>
                  Merchant QR is verified. Tap PAY NOW to start ledger submission.
                </p>
                <button
                  type="button"
                  className="btn btn-primary qr-scanner-manual-btn"
                  onClick={() => void createPaymentIntent()}
                  disabled={refreshingIntent}
                >
                  {refreshingIntent ? "Starting payment..." : "PAY NOW"}
                </button>
              </div>
            ) : proof?.txRef ? (
              <div className="proof-panel proof-panel-confirmed">
                <p className="eyebrow">Step 2 of 2 — Ledger Transaction</p>
                <h2 className="status-confirmed">Payment Recorded</h2>
                <div className="proof-panel-body">
                  <p>Store: {proof.tenantId}</p>
                  <p className="mono">Transaction: {proof.txRef}</p>
                  <p>Ledger #: {proof.ledger ?? "—"}</p>
                  <p>Paid: {proof.paidAmount} {proof.assetCode || "XLM"}</p>
                  <p className="mono">From: {proof.sourceAccount || "—"}</p>
                  <p className="mono">To: {proof.destinationAccount || "—"}</p>
                  {proof.explorerUrl ? (
                    <a
                      href={proof.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="proof-explorer-link"
                    >
                      View on Stellar Explorer
                    </a>
                  ) : null}
                  <ul className="proof-timeline">
                    {(proof.timeline || []).map((item) => (
                      <li key={`${item.status}-${item.at}`}>
                        {item.status.toUpperCase()} — {new Date(item.at).toLocaleTimeString()}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : ledgerTimedOut ? (
              <div className="panel qr-scan-verified">
                <p className="eyebrow">Step 2 of 2</p>
                <h2>Ledger Check Timed Out</h2>
                <p className="subcopy" style={{ marginBottom: 12 }}>
                   Stellar testnet is taking longer than expected. Tap below to resubmit and try again.
                </p>
                <button type="button" className="btn btn-primary" onClick={retryLedgerCheck}>
                   Resubmit Payment
                </button>
              </div>
            ) : (
              <div className="panel qr-scan-verified">
                <p className="eyebrow">Step 2 of 2</p>
                <h2>Submitting to ledger…</h2>
                <div className="ledger-submit-progress">
                  <span className="ledger-submit-spinner" aria-hidden="true" />
                  <span className="ledger-submit-label">
                    {submitSeconds < 20
                      ? `Connecting to Stellar network… ${submitSeconds}s`
                      : `Still working — Stellar testnet can take up to ${MAX_LEDGER_WAIT_SECONDS}s… ${submitSeconds}s`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      <AddToHomeScreenBanner />
    </div>
  );
}

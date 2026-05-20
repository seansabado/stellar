"use client";

import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  signInWithRedirect,
  onAuthStateChanged,
  setPersistence,
  signOut,
  browserLocalPersistence,
  type User,
} from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { auth } from "./firebase";
import { clearReceipts } from "./receiptStore";

export const CUSTOMER_DEMO_TENANT_ID = "demo-tenant-ph";
const CUSTOMER_SESSION_KEY = "stellarpay.customerSession.v1";
const CUSTOMER_LAST_LOGIN_RESET_KEY = "stellarpay.lastLoginReset.v1";

type CustomerSession = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  tenantId: string;
};

type CustomerAuthContextValue = {
  user: User | null;
  loading: boolean;
  tenantId: string;
  session: CustomerSession | null;
  signInWithGoogleCredential: (idToken: string) => Promise<void>;
  signInWithGooglePopup: () => Promise<void>;
  signInWithGoogleRedirect: () => Promise<void>;
  signOutCustomer: () => Promise<void>;
};

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

function writeSession(user: User | null) {
  if (typeof window === "undefined") return;

  if (!user) {
    window.localStorage.removeItem(CUSTOMER_SESSION_KEY);
    return;
  }

  const session: CustomerSession = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    tenantId: CUSTOMER_DEMO_TENANT_ID,
  };

  window.localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(session));
}

function bindDemoTenant() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("lubotos.tenantId", CUSTOMER_DEMO_TENANT_ID);
  window.localStorage.setItem("tenantId", CUSTOMER_DEMO_TENANT_ID);
  window.sessionStorage.setItem("lubotos.demoSession", "1");
}

function clearDemoTenantBinding() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("tenantId");
  window.localStorage.removeItem("lubotos.tenantId");
  window.sessionStorage.removeItem("lubotos.demoSession");
}

async function resetDemoOrdersForLogin(user: User) {
  if (typeof window === "undefined") return;

  const loginStamp = user.metadata.lastSignInTime || user.metadata.creationTime || "";
  const marker = `${user.uid}:${String(loginStamp)}`;
  const previous = window.localStorage.getItem(CUSTOMER_LAST_LOGIN_RESET_KEY);
  if (previous === marker) return;

  const syncResponse = await fetch(
    `/api/orders?tenantId=${CUSTOMER_DEMO_TENANT_ID}&sync=1`,
    { method: "GET" },
  );

  if (!syncResponse.ok) {
    throw new Error("Demo sync endpoint failed.");
  }

  clearReceipts();
  window.localStorage.setItem(CUSTOMER_LAST_LOGIN_RESET_KEY, marker);
}

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void setPersistence(auth, browserLocalPersistence).catch(() => {
      // Ignore persistence fallback failures; auth still works with default persistence.
    });

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      if (!active) return;
      setUser(nextUser);
      if (nextUser) {
        bindDemoTenant();
        void resetDemoOrdersForLogin(nextUser).catch(() => {
          // Keep login successful even if demo reseed endpoint is unavailable.
        });
      } else {
        clearDemoTenantBinding();
      }
      writeSession(nextUser);
      setLoading(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo<CustomerAuthContextValue>(
    () => ({
      user,
      loading,
      tenantId: CUSTOMER_DEMO_TENANT_ID,
      session:
        user
          ? {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              tenantId: CUSTOMER_DEMO_TENANT_ID,
            }
          : null,
      async signInWithGoogleCredential(idToken: string) {
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
      },
      async signInWithGooglePopup() {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      },
      async signInWithGoogleRedirect() {
        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
      },
      async signOutCustomer() {
        await signOut(auth);
      },
    }),
    [loading, user],
  );

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  }
  return context;
}

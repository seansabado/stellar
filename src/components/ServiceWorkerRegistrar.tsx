"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    // In local dev, unregister old SWs and clear caches to prevent stale Next assets.
    if (isLocalhost) {
      const cleanupLocal = async () => {
        try {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((reg) => reg.unregister()));

          if ("caches" in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map((name) => caches.delete(name)));
          }
        } catch {
          // Ignore cleanup failures in dev; app should remain usable.
        }
      };

      void cleanupLocal();
      return;
    }

    const register = async () => {
      try {
        let reloading = false;
        const onControllerChange = () => {
          if (reloading) return;
          reloading = true;
          window.location.reload();
        };

        navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

        const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });

        const activateUpdate = (worker: ServiceWorker | null) => {
          if (!worker) return;
          worker.postMessage({ type: "SKIP_WAITING" });
        };

        // Apply already waiting updates immediately.
        activateUpdate(registration.waiting);

        // Apply newly found updates as soon as they are installed.
        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              activateUpdate(registration.waiting || installing);
            }
          });
        });

        // Trigger update check on page load.
        await registration.update();
      } catch {
        // Keep UI resilient even when SW registration fails.
      }
    };

    void register();
  }, []);

  return null;
}

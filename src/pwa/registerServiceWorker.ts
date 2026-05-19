import { useSyncExternalStore } from "react";

type BeforeInstallPromptEvent = Event & {
  readonly platforms: string[];
  prompt: () => Promise<void> | void;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export type PwaState = {
  supported: boolean;
  registered: boolean;
  installPromptReady: boolean;
  installed: boolean;
  updateAvailable: boolean;
  online: boolean;
  lastError: string | null;
};

type PwaListener = () => void;

const DEFAULT_STATE: PwaState = {
  supported: false,
  registered: false,
  installPromptReady: false,
  installed: false,
  updateAvailable: false,
  online: typeof navigator !== "undefined" ? navigator.onLine : true,
  lastError: null,
};

let state: PwaState = DEFAULT_STATE;
let listeners = new Set<PwaListener>();
let registrationPromise: Promise<void> | null = null;
let registration: ServiceWorkerRegistration | null = null;
let deferredPrompt: BeforeInstallPromptEvent | null = null;
let listenersAttached = false;
let shouldReloadAfterUpdate = false;

function isLocalDevEnvironment() {
  if (typeof window === "undefined") return false;

  // Keep unit tests deterministic by skipping local-dev reset behavior.
  if (import.meta.env.MODE === "test") return false;

  const localhostHosts = new Set(["localhost", "127.0.0.1", "::1"]);
  return import.meta.env.DEV || localhostHosts.has(window.location.hostname);
}

async function resetServiceWorkerStateForDev() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((item) => item.unregister()));

  if (typeof caches === "undefined") return;

  const cacheKeys = await caches.keys();
  const serviceWorkerCaches = cacheKeys.filter(
    (key) => key.startsWith("lubotos-shell-") || key.startsWith("workbox-"),
  );
  await Promise.all(serviceWorkerCaches.map((key) => caches.delete(key)));
}

export async function hardRefreshClient() {
  await resetServiceWorkerStateForDev();
  if (typeof window !== "undefined") {
    window.location.reload();
  }
}

function emit(nextState: Partial<PwaState>) {
  state = { ...state, ...nextState };
  listeners.forEach((listener) => listener());
}

function attachWindowListeners() {
  if (listenersAttached || typeof window === "undefined") return;
  listenersAttached = true;

  const handleConnectivityChange = () => {
    emit({ online: navigator.onLine });
  };

  const handleBeforeInstallPrompt = (event: Event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    emit({ installPromptReady: true, lastError: null });
  };

  const handleAppInstalled = () => {
    deferredPrompt = null;
    emit({ installed: true, installPromptReady: false });
  };

  const handleControllerChange = () => {
    emit({ registered: true, updateAvailable: false });
    if (shouldReloadAfterUpdate) {
      shouldReloadAfterUpdate = false;
      window.location.reload();
    }
  };

  window.addEventListener("online", handleConnectivityChange);
  window.addEventListener("offline", handleConnectivityChange);
  window.addEventListener(
    "beforeinstallprompt",
    handleBeforeInstallPrompt as EventListener,
  );
  window.addEventListener("appinstalled", handleAppInstalled);
  navigator.serviceWorker?.addEventListener(
    "controllerchange",
    handleControllerChange,
  );
}

function trackInstallingWorker(worker: ServiceWorker) {
  worker.addEventListener("statechange", () => {
    if (worker.state === "installed") {
      emit({
        installed: navigator.serviceWorker.controller === null,
        updateAvailable: navigator.serviceWorker.controller !== null,
      });
    }

    if (worker.state === "redundant") {
      emit({ updateAvailable: false });
    }
  });
}

function watchRegistrationUpdates(nextRegistration: ServiceWorkerRegistration) {
  const existingInstalling = nextRegistration.installing;
  if (existingInstalling) {
    trackInstallingWorker(existingInstalling);
  }

  nextRegistration.addEventListener("updatefound", () => {
    const installing = nextRegistration.installing;
    if (installing) {
      trackInstallingWorker(installing);
    }
  });

  if (nextRegistration.waiting) {
    emit({ updateAvailable: true });
  }
}

export function subscribePwaState(listener: PwaListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPwaState() {
  return state;
}

export function usePwaState() {
  const snapshot = useSyncExternalStore(
    subscribePwaState,
    getPwaState,
    getPwaState,
  );

  return {
    ...snapshot,
    canInstall:
      snapshot.supported && snapshot.installPromptReady && !snapshot.installed,
    isActionable:
      snapshot.updateAvailable || (snapshot.supported && !snapshot.installed),
    async promptInstall() {
      return promptInstall();
    },
    async refreshApp() {
      return refreshServiceWorker();
    },
  };
}

export async function registerServiceWorker() {
  if (registrationPromise) return registrationPromise;

  registrationPromise = (async () => {
    if (
      typeof window === "undefined" ||
      typeof navigator === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      emit({ supported: false, registered: false });
      return;
    }

    if (isLocalDevEnvironment()) {
      await resetServiceWorkerStateForDev();
      emit({
        supported: false,
        registered: false,
        installPromptReady: false,
        installed: false,
        updateAvailable: false,
        lastError: null,
      });
      return;
    }

    attachWindowListeners();

    emit({ supported: true, lastError: null, online: navigator.onLine });

    try {
      const nextRegistration = await navigator.serviceWorker.register(
        "/sw.js",
        { scope: "/" },
      );
      registration = nextRegistration;
      emit({ registered: true, lastError: null });
      watchRegistrationUpdates(nextRegistration);
    } catch (error) {
      emit({
        registered: false,
        lastError:
          error instanceof Error
            ? error.message
            : "Service worker registration failed",
      });
    }
  })();

  return registrationPromise;
}

export async function promptInstall() {
  if (!deferredPrompt) return false;

  const installPrompt = deferredPrompt;
  deferredPrompt = null;
  emit({ installPromptReady: false });

  await installPrompt.prompt();
  const result = await installPrompt.userChoice;
  if (result.outcome === "accepted") {
    emit({ installed: true });
    return true;
  }

  emit({ installPromptReady: false });
  return false;
}

export async function refreshServiceWorker() {
  if (!registration) return false;

  if (registration.waiting) {
    shouldReloadAfterUpdate = true;
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
    return true;
  }

  await registration.update();
  return true;
}

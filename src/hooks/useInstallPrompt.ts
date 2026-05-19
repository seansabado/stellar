import { useEffect, useState, useCallback } from "react";

const useInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setIsInstalled(true));
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const promptToInstall = useCallback(() => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      setShowPrompt(false);
    }
  }, [deferredPrompt]);

  return { showPrompt, promptToInstall, isInstalled };
};

export default useInstallPrompt;

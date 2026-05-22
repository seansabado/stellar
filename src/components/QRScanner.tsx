"use client";

import React from "react";

type QRScannerProps = {
  onScan: (data: string) => void;
  /** Return true if the scanned data is valid. If provided, PAY NOW is hidden until validation passes. */
  onValidate?: (data: string) => boolean;
  onError?: (message: string) => void;
  autoStart?: boolean;
  allowManualConfirm?: boolean;
  manualConfirmValue?: string;
  manualConfirmLabel?: string;
  title?: string;
  description?: string;
};

function getBarcodeDetector(): any | null {
  if (typeof window === "undefined") return null;
  const detectorCtor = (window as Window & { BarcodeDetector?: any }).BarcodeDetector;
  if (!detectorCtor) return null;
  try {
    return new detectorCtor({ formats: ["qr_code"] });
  } catch {
    return null;
  }
}

export default function QRScanner({
  onScan,
  onValidate,
  onError,
  autoStart = false,
  allowManualConfirm = false,
  manualConfirmValue = "manual-confirm",
  manualConfirmLabel = "I scanned the printed QR",
  title = "Camera scan",
  description = "Point your camera at the printed Stellar QR.",
}: QRScannerProps) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const animationRef = React.useRef<number | null>(null);
  const detectorRef = React.useRef<any | null>(null);
  const scannedRef = React.useRef(false);
  const retryTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapAtRef = React.useRef(0);
  // Keep refs up-to-date without adding to useCallback deps
  const onValidateRef = React.useRef(onValidate);
  onValidateRef.current = onValidate;
  const startCameraRef = React.useRef<(() => Promise<void>) | null>(null);
  const [status, setStatus] = React.useState("Tap Open Camera to begin.");
  const [active, setActive] = React.useState(false);
  const [cameraBusy, setCameraBusy] = React.useState(false);
  const [detectorSupported, setDetectorSupported] = React.useState(true);
  const [openAttempted, setOpenAttempted] = React.useState(false);
  const [capturedData, setCapturedData] = React.useState<string | null>(null);
  /** null = not scanned, true = valid, false = invalid */
  const [scanValid, setScanValid] = React.useState<boolean | null>(null);

  const requestCameraStream = React.useCallback(async (): Promise<MediaStream> => {
    const attempts: MediaStreamConstraints[] = [
      {
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      },
      {
        audio: false,
        video: { facingMode: "environment" },
      },
      {
        audio: false,
        video: true,
      },
    ];

    let lastError: unknown = null;
    for (const constraints of attempts) {
      try {
        return await navigator.mediaDevices.getUserMedia(constraints);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError ?? new Error("Unable to open the camera.");
  }, []);

  const stopCamera = React.useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setActive(false);
  }, []);

  const scanFrame = React.useCallback(async () => {
    const video = videoRef.current;
    const detector = detectorRef.current;
    if (!video || !detector || !active) return;

    try {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        const codes = await detector.detect(video);
        const raw = codes?.[0]?.rawValue;
        if (raw && !scannedRef.current) {
          scannedRef.current = true;
          stopCamera();
          const validator = onValidateRef.current;
          if (validator) {
            const isValid = validator(raw);
            if (isValid) {
              setCapturedData(raw);
              setScanValid(true);
              setStatus("Store QR detected. Tap Verify QR to unlock PAY NOW.");
            } else {
              setScanValid(false);
              setStatus("Wrong QR code. Scanning again…");
              retryTimeoutRef.current = setTimeout(() => {
                scannedRef.current = false;
                setScanValid(null);
                setCapturedData(null);
                void startCameraRef.current?.();
              }, 2500);
            }
          } else {
            // No validator — original behaviour
            setCapturedData(raw);
            setStatus("QR detected. Tap PAY NOW to continue.");
          }
          return;
        }
      }
    } catch {
      // Keep scanning; transient decode errors are expected.
    }

    animationRef.current = requestAnimationFrame(scanFrame);
  }, [active, onScan, stopCamera]);

  const startCamera = React.useCallback(async () => {
    if (cameraBusy) {
      return;
    }

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      const message = "Camera is not available in this browser.";
      setOpenAttempted(true);
      setStatus(message);
      onError?.(message);
      return;
    }

    setCameraBusy(true);
    stopCamera();
    const detector = getBarcodeDetector();
    detectorRef.current = detector;
    setDetectorSupported(Boolean(detector));
    scannedRef.current = false;
      setScanValid(null);
    setOpenAttempted(true);
    setStatus("Opening camera...");

    try {
      const stream = await requestCameraStream();
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        video.setAttribute("playsinline", "true");
        video.setAttribute("webkit-playsinline", "true");
        try {
          await video.play();
        } catch {
          // iOS PWA can reject initial play() even when stream is granted.
        }
      }
      setActive(true);
      if (detector) {
        setStatus("Camera is live. Scan the printed store QR.");
        animationRef.current = requestAnimationFrame(scanFrame);
      } else {
        setStatus(
          "Camera is live. Automatic QR detection is unavailable in this browser. After scanning the printed QR, tap PAY NOW.",
        );
        onError?.(
          "Automatic QR detection is unavailable in this browser. Tap PAY NOW after scanning.",
        );
      }
      setCameraBusy(false);
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : "Unable to open the camera.";
      const message =
        typeof window !== "undefined" &&
        window.location.protocol !== "https:" &&
        window.location.hostname !== "localhost"
          ? "Camera needs a secure page (HTTPS). Open the live HTTPS site and try again."
          :
        error instanceof DOMException && error.name === "AbortError"
          ? "Camera preview was interrupted. Tap Open Camera again."
          : error instanceof DOMException && error.name === "NotReadableError"
            ? "Camera is busy in another app or tab. Close it, then tap Open Camera again."
            : error instanceof DOMException && error.name === "NotFoundError"
              ? "No camera was found on this device."
          : rawMessage.includes("play() request was interrupted")
            ? "Camera preview was interrupted. Tap Open Camera again."
            : rawMessage.includes("Permission") || rawMessage.includes("denied")
              ? "Camera access was blocked. Allow camera permission, then try again."
              : "Unable to open the camera right now. Try again.";
        setCapturedData(null);
      setStatus(message);
      onError?.(message);
        setCameraBusy(false);
      stopCamera();
    }
    }, [cameraBusy, onError, requestCameraStream, scanFrame, stopCamera]);

    const runTapAction = React.useCallback((action: () => void) => {
      const now = Date.now();
      if (now - lastTapAtRef.current < 300) {
        return;
      }
      lastTapAtRef.current = now;
      action();
    }, []);

    const getTapHandlers = React.useCallback((action: () => void) => ({
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        runTapAction(action);
      },
      onPointerUp: (event: React.PointerEvent<HTMLButtonElement>) => {
        if (event.pointerType === "touch" || event.pointerType === "pen") {
          runTapAction(action);
        }
      },
    }), [runTapAction]);

    const openCamera = React.useCallback(() => {
      void startCamera();
    }, [startCamera]);

    const confirmScan = React.useCallback(() => {
      setStatus("Processing your payment request...");
      onScan(capturedData ?? manualConfirmValue);
    }, [capturedData, manualConfirmValue, onScan]);

  React.useEffect(() => {
    if (!autoStart) return;
    void startCamera();
    return () => {
      stopCamera();
    };
  }, [autoStart, startCamera, stopCamera]);

  React.useEffect(() => stopCamera, [stopCamera]);

  // Register startCamera ref after it is defined (avoids circular useCallback deps)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => { startCameraRef.current = startCamera; }, [startCamera]);

  return (
    <section className="panel qr-scanner-card">
      <div className="qr-scanner-head">
        <div>
          <p className="eyebrow">{title}</p>
          <h2>Scan the printed payment QR</h2>
        </div>
        {!active ? (
          <button
            type="button"
            className="btn btn-secondary qr-scanner-open-btn"
            disabled={cameraBusy}
            {...getTapHandlers(openCamera)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="qr-scanner-open-icon"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span>{detectorSupported ? "Open Camera" : "Open Camera Preview"}</span>
          </button>
        ) : (
          <button type="button" className="btn btn-ghost" {...getTapHandlers(stopCamera)}>
            Stop Camera
          </button>
        )}
      </div>

      <p className="subcopy">{description}</p>
      {openAttempted ? (
        <>
          <div className="qr-scanner-frame">
            <video ref={videoRef} className="qr-scanner-video" playsInline muted autoPlay />
            {!active ? (
              <div className="qr-scanner-placeholder">
                {cameraBusy ? "Opening camera..." : "Camera preview unavailable. Tap Open Camera."}
              </div>
            ) : null}
          </div>
          <p className="qr-scanner-status">{status}</p>
        </>
      ) : null}
      {/* Valid scan badge */}
      {scanValid === true ? (
        <div className="qr-scan-badge qr-scan-badge-valid">&#10003;&ensp;Store QR verified</div>
      ) : null}
      {/* Invalid scan badge — auto-retries */}
      {scanValid === false ? (
        <div className="qr-scan-badge qr-scan-badge-invalid">&#10007;&ensp;Wrong QR — opening camera again&hellip;</div>
      ) : null}
      {/* No-detector notice — browser can't auto-read QR codes */}
      {openAttempted && !detectorSupported ? (
        <p className="qr-scanner-no-detector-notice">
          Auto-scan not available on this browser. Point your camera at the printed store QR,
          then tap <strong>PAY NOW</strong>.
        </p>
      ) : null}
      {/* PAY NOW: visible after valid scan (detector path) OR immediately as fallback (no-detector path) */}
      {allowManualConfirm && openAttempted &&
        (scanValid === true || !detectorSupported) ? (
        <button
          type="button"
          className="btn btn-primary qr-scanner-manual-btn"
          {...getTapHandlers(confirmScan)}
        >
          {manualConfirmLabel}
        </button>
      ) : null}
    </section>
  );
}

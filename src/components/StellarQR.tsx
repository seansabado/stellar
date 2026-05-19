import React from "react";
import QRCode from "qrcode";

interface StellarQRProps {
  qrData: string;
  network: "testnet" | "mainnet";
}

const StellarQR: React.FC<StellarQRProps> = ({ qrData, network }) => {
  const [qrUrl, setQrUrl] = React.useState<string>("");

  React.useEffect(() => {
    let mounted = true;
    QRCode.toDataURL(qrData, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 256,
    })
      .then((url) => {
        if (mounted) setQrUrl(url);
      })
      .catch(() => {
        if (mounted) setQrUrl("");
      });
    return () => {
      mounted = false;
    };
  }, [qrData]);

  return (
    <div className="flex flex-col items-center">
      {qrUrl ? (
        <img src={qrUrl} alt="Stellar payment QR" width={256} height={256} />
      ) : (
        <div className="h-64 w-64 animate-pulse bg-gray-200" />
      )}
      <p className="mt-2 text-xs text-gray-500">
        Scan with a Stellar wallet ({network})
      </p>
    </div>
  );
};

export default StellarQR;

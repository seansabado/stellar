import React from "react";
import QRCode from "qrcode.react";

interface StellarQRProps {
  qrData: string;
  network: "testnet" | "mainnet";
}

const StellarQR: React.FC<StellarQRProps> = ({ qrData, network }) => (
  <div className="flex flex-col items-center">
    <QRCode value={qrData} size={256} level="H" includeMargin={true} />
    <p className="mt-2 text-xs text-gray-500">
      Scan with a Stellar wallet ({network})
    </p>
  </div>
);

export default StellarQR;

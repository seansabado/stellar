import React, { useCallback } from "react";
// import { QrReader } from 'react-qr-reader'; // Uncomment if using react-qr-reader

interface QRScannerProps {
  onScan: (data: string | null) => void;
  onError?: (err: any) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onError }) => {
  // Uncomment and install react-qr-reader for real implementation
  // return (
  //   <QrReader
  //     onResult={(result, error) => {
  //       if (!!result) onScan(result.getText());
  //       if (!!error && onError) onError(error);
  //     }}
  //     constraints={{ facingMode: 'environment' }}
  //     style={{ width: '100%' }}
  //   />
  // );
  return (
    <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded">
      <p className="text-gray-500">Camera access required for QR scanning.</p>
      {/* Fallback UI if camera is denied */}
    </div>
  );
};

export default QRScanner;

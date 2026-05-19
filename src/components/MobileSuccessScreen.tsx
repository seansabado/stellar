import React from "react";

const MobileSuccessScreen: React.FC<{ orderId: string }> = ({ orderId }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-green-50">
    <svg
      className="w-20 h-20 text-green-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
    <h2 className="text-2xl font-bold mt-4 mb-2">Payment Confirmed!</h2>
    <p className="mb-4">Order #{orderId} is now paid.</p>
    <a href="/" className="text-blue-600 underline">
      Return to Home
    </a>
  </div>
);

export default MobileSuccessScreen;
